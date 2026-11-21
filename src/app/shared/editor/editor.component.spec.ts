import { Component, provideZonelessChangeDetection, signal, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { cleanListParagraphs, EditorComponent, toCoreLocale } from './editor.component';

@Component({
  standalone: true,
  imports: [EditorComponent, ReactiveFormsModule],
  template: `<app-editor
    [formControl]="control"
    [toolbarPreset]="preset()"
    [enableBold]="bold()"
    [wordLimit]="wordLimit()"
    [readonly]="readonly()"
    (jsonChange)="json = $event"
  ></app-editor>`,
})
class HostComponent {
  @ViewChild(EditorComponent, { static: true }) editor!: EditorComponent;
  control = new FormControl('<p>inicial</p>');
  // Signals: zoneless change detection only picks up signal changes in the host.
  preset = signal<'minimal' | 'basic' | 'full'>('full');
  bold = signal(true);
  wordLimit = signal<number | undefined>(undefined);
  readonly = signal(false);
  json: unknown = null;
}

describe('EditorComponent', () => {
  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const update = (): void => fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, update };
  };

  it('maps ngx-translate codes to core locales', () => {
    expect(toCoreLocale('pt_br')).toBe('pt-BR');
    expect(toCoreLocale('en')).toBe('en');
    expect(toCoreLocale(undefined)).toBe('pt-BR');
  });

  it('keeps the original list HTML format', () => {
    expect(cleanListParagraphs('<ul><li><p>a</p></li><li><p>b</p></li></ul>')).toBe('<ul><li>a</li><li>b</li></ul>');
  });

  it('writes the form value into the core editor and reports edits', async () => {
    const { host } = await setup();
    const ui = host.editor.editor!;
    expect(ui.editor.getHTML()).toBe('<p>inicial</p>');
    ui.editor.commands.insertContentAt(1, 'texto ');
    expect(host.control.value).toBe('<p>texto inicial</p>');
    expect(host.json).toEqual(ui.editor.getJSON());
    host.control.setValue('<ul><li><p>item</p></li></ul>');
    expect(ui.editor.getHTML()).toMatch(/^<ul><li><p>item<\/p><\/li><\/ul>/);
    ui.editor.commands.insertContentAt(3, 'novo ');
    expect(host.control.value).toBe('<ul><li>novo item</li></ul>');
  });

  it('disables and enables with the form control and readonly', async () => {
    const { host, update } = await setup();
    host.control.disable();
    expect(host.editor.editor!.editor.isEditable).toBe(false);
    host.control.enable();
    expect(host.editor.editor!.editor.isEditable).toBe(true);
    host.readonly.set(true);
    update();
    expect(host.editor.editor!.editor.isEditable).toBe(false);
  });

  it('hides disabled commands and rebuilds on structural inputs', async () => {
    const { fixture, host, update } = await setup();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.kt-toolbar-host button[data-command="bold"]')).not.toBeNull();
    host.bold.set(false);
    host.preset.set('minimal');
    host.wordLimit.set(5);
    update();
    expect(root.querySelector('.kt-toolbar-host button[data-command="bold"]')).toBeNull();
    expect(root.querySelectorAll('.kt-toolbar-host button')).toHaveLength(3);
    expect(root.querySelector('[data-counter="words"]')?.textContent).toBe('Palavras: 1/5');
    expect(host.editor.editor!.editor.getHTML()).toBe('<p>inicial</p>');
  });
});
