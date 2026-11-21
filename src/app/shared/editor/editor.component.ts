import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  BALLOON_PRESET,
  createEditorUI,
  TOOLBAR_PRESETS,
  type DocumentLimits,
  type EditorFeatures,
  type EditorMode,
  type EditorUI,
  type EditorUIOptions,
  type MentionItem,
  type ToolbarItem,
} from '@kelsoncm/tiptap-core';
import type { JSONContent } from '@tiptap/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { fontAwesomeIcon } from './icons';

/** ngx-translate language codes (pt_br) -> core locales (pt-BR). */
export const toCoreLocale = (lang: string | undefined): string =>
  (lang ?? 'pt-BR').replace('_', '-').replace(/-(\w+)$/, (_m, region: string) => `-${region.toUpperCase()}`);

/** Toolbar commands hidden by each `enable*` input. */
const COMMANDS_BY_INPUT: Record<string, readonly string[]> = {
  enableBold: ['bold'],
  enableItalic: ['italic'],
  enableStrike: ['strike'],
  enableCode: ['code', 'codeBlock'],
  enableMention: ['mention'],
};

/** Removes `<p>` wrappers directly inside `<li>` (format kept from the first tiptap-ng). */
export function cleanListParagraphs(html: string): string {
  let previous: string;
  let current = html;
  const pattern = /(<li\b[^>]*>)\s*<p\b[^>]*>([\s\S]*?)<\/p>\s*(<\/li>)/gi;
  let guard = 0;
  do {
    previous = current;
    current = current.replace(pattern, (_m, start: string, inner: string, end: string) => `${start}${inner}${end}`);
    guard++;
  } while (current !== previous && guard < 10);
  return current;
}

/**
 * `<app-editor>`: Angular wrapper of `createEditorUI` from `@kelsoncm/tiptap-core`, usable
 * with reactive forms and `ngModel` (value = HTML).
 */
@Component({
  selector: 'app-editor',
  standalone: true,
  template: '<div #host class="app-editor-host"></div>',
  styleUrl: './editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditorComponent), multi: true }],
})
export class EditorComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  // ---- appearance and mode
  /** i18n key (resolved by the core or ngx-translate) or literal text. */
  @Input() placeholder = 'editor.placeholders.default';
  @Input() minHeight = '200px';
  @Input() maxHeight?: string;
  @Input() toolbarPreset: 'minimal' | 'basic' | 'full' = 'full';
  @Input() mode: EditorMode = 'toolbar';
  @Input() readonly = false;

  // ---- features (same names as the first tiptap-ng)
  @Input() enableHeading = true;
  @Input() enableBold = true;
  @Input() enableItalic = true;
  @Input() enableStrike = true;
  @Input() enableCode = true;
  @Input() enableMention = true;
  @Input() enableSubscript = true;
  @Input() enableSuperscript = true;
  @Input() enableLineHeight = true;
  @Input() enableFontFamily = true;
  @Input() enableFontSize = true;
  @Input() enableTextColor = true;
  @Input() enableHighlight = true;
  @Input() enableTextAlign = true;
  @Input() enableTable = true;
  @Input() enableBalloonMenu = true;
  @Input() enablePageBreak = true;
  @Input() enableTableOfContents = false;
  @Input() mentionItems: MentionItem[] = [
    { id: 'inicioEdital', label: 'inicioEdital' },
    { id: 'fimEdital', label: 'fimEdital' },
    { id: 'nomeEdital', label: 'nomeEdital' },
    { id: 'descricaoEdital', label: 'descricaoEdital' },
  ];

  // ---- footer and limits
  @Input() showFooter = true;
  @Input() characterLimit?: number;
  @Input() characterMinimum?: number;
  @Input() wordLimit?: number;
  @Input() wordMinimum?: number;
  @Input() paragraphLimit?: number;
  @Input() paragraphMinimum?: number;

  /** Keep the original `<li>text</li>` HTML (no `<p>` inside list items). */
  @Input() cleanListParagraphs = true;
  /** Any other `createEditorUI` option (media, revision, checkers, plugins...). */
  @Input() options: Partial<EditorUIOptions> = {};

  @Output() jsonChange = new EventEmitter<JSONContent>();
  @Output() htmlChange = new EventEmitter<string>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() focus = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() blur = new EventEmitter<void>();
  @Output() ready = new EventEmitter<EditorUI>();

  private readonly zone = inject(NgZone);
  private readonly translate = inject(TranslateService, { optional: true });
  private ui: EditorUI | null = null;
  private value = '';
  private disabled = false;
  private langSubscription?: Subscription;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** The core editor (commands, i18n, Tiptap instance). */
  get editor(): EditorUI | null {
    return this.ui;
  }

  ngAfterViewInit(): void {
    this.create();
    this.langSubscription = this.translate?.onLangChange.subscribe(({ lang }) =>
      this.ui?.i18n.setLocale(toCoreLocale(lang)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ui) return;
    const keys = Object.keys(changes);
    if (keys.every((key) => key === 'mode' || key === 'readonly')) {
      this.applyMode();
      return;
    }
    // Structural options: rebuild keeping the content.
    this.value = this.html();
    this.destroy();
    this.create();
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.destroy();
  }

  // ---- ControlValueAccessor
  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.ui?.editor.commands.setContent(this.value, { emitUpdate: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.applyMode();
  }

  // ---- internals
  private features(): Partial<EditorFeatures> {
    return {
      subscript: this.enableSubscript,
      superscript: this.enableSuperscript,
      lineHeight: this.enableLineHeight,
      fontFamily: this.enableFontFamily,
      fontSize: this.enableFontSize,
      textColor: this.enableTextColor,
      highlight: this.enableHighlight,
      textAlign: this.enableTextAlign,
      table: this.enableTable,
      pageBreak: this.enablePageBreak,
      tableOfContents: this.enableTableOfContents,
    };
  }

  private limits(): DocumentLimits {
    const limits: DocumentLimits = {};
    if (this.characterLimit !== undefined) limits.maxCharacters = this.characterLimit;
    if (this.characterMinimum !== undefined) limits.minCharacters = this.characterMinimum;
    if (this.wordLimit !== undefined) limits.maxWords = this.wordLimit;
    if (this.wordMinimum !== undefined) limits.minWords = this.wordMinimum;
    if (this.paragraphLimit !== undefined) limits.maxParagraphs = this.paragraphLimit;
    if (this.paragraphMinimum !== undefined) limits.minParagraphs = this.paragraphMinimum;
    return limits;
  }

  /** Preset minus the commands disabled by `enable*` inputs. */
  private filterItems(items: readonly ToolbarItem[]): ToolbarItem[] {
    const hidden = new Set(
      Object.entries(COMMANDS_BY_INPUT)
        .filter(([input]) => !(this as unknown as Record<string, boolean>)[input])
        .flatMap(([, commands]) => commands),
    );
    if (!this.enableHeading) hidden.add('heading');
    return items.filter((item) => {
      if (typeof item === 'string') return !hidden.has(item) && !(item.startsWith('heading-') && hidden.has('heading'));
      if (item.type === 'commands') return !(hidden.has('heading') && item.commands.some((c) => c.startsWith('heading-')));
      return true;
    });
  }

  private create(): void {
    const element = this.host.nativeElement;
    const placeholder = this.translate?.instant(this.placeholder) ?? this.placeholder;
    this.zone.runOutsideAngular(() => {
      this.ui = createEditorUI(element, {
        ...this.options,
        content: this.value,
        mode: this.mode,
        toolbar: this.filterItems(TOOLBAR_PRESETS[this.toolbarPreset] ?? TOOLBAR_PRESETS.full),
        balloon: this.enableBalloonMenu ? this.filterItems(BALLOON_PRESET) : false,
        placeholder,
        minHeight: this.minHeight,
        ...(this.maxHeight ? { maxHeight: this.maxHeight } : {}),
        statusBar: this.showFooter,
        limits: { ...this.limits(), ...this.options.limits },
        features: { ...this.features(), ...this.options.features },
        ...(this.enableHeading ? {} : { starterKit: { heading: false, ...this.options.starterKit } }),
        ...(this.enableMention && this.mentionItems.length && !this.options.mentions
          ? { mentions: { items: this.mentionItems } }
          : {}),
        i18n: this.options.i18n ?? { locale: toCoreLocale(this.translate?.getCurrentLang() ?? undefined) },
        renderIcon: this.options.renderIcon ?? fontAwesomeIcon,
      });
    });
    const ui = this.ui as EditorUI | null;
    if (!ui) return;
    ui.editor.on('update', this.handleUpdate);
    ui.editor.on('focus', this.handleFocus);
    ui.editor.on('blur', this.handleBlur);
    this.applyMode();
    this.ready.emit(ui);
  }

  private destroy(): void {
    if (!this.ui) return;
    this.ui.editor.off('update', this.handleUpdate);
    this.ui.editor.off('focus', this.handleFocus);
    this.ui.editor.off('blur', this.handleBlur);
    this.ui.destroy();
    this.ui = null;
  }

  private applyMode(): void {
    this.ui?.setMode(this.readonly || this.disabled ? 'readonly' : this.mode);
  }

  private html(): string {
    if (!this.ui || this.ui.editor.isEmpty) return '';
    // The empty paragraph the editor keeps after tables/lists is an editing aid, not content.
    const html = this.ui.editor.getHTML().replace(/(?:<p><\/p>)+$/, '');
    return this.cleanListParagraphs ? cleanListParagraphs(html) : html;
  }

  private handleUpdate = (): void => {
    const html = this.html();
    const json = this.ui?.editor.getJSON();
    this.zone.run(() => {
      this.value = html;
      this.onChange(html);
      this.htmlChange.emit(html);
      if (json) this.jsonChange.emit(json);
    });
  };

  private handleFocus = (): void => {
    this.zone.run(() => this.focus.emit());
  };

  private handleBlur = (): void => {
    this.zone.run(() => {
      this.onTouched();
      this.blur.emit();
    });
  };
}
