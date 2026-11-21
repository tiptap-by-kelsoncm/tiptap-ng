import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import type { JSONContent } from '@tiptap/core';

import { EditorComponent } from './shared/editor';
import { I18nService } from './shared/services/i18n.service';

type Tab = 'form' | 'html' | 'json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe, ReactiveFormsModule, FormsModule, EditorComponent, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly i18nService = inject(I18nService);

  readonly form: FormGroup = this.fb.group({
    body: ['<p>Texto inicial vindo do form.</p>'],
  });
  editorJson: JSONContent | null = null;
  editorFocused = false;
  activeTab: Tab = 'form';
  currentLanguage = 'pt_br';
  supportedLanguages: string[] = [];

  ngOnInit(): void {
    this.supportedLanguages = this.i18nService.getSupportedLanguages();
    this.currentLanguage = this.i18nService.getCurrentLanguage();
    this.i18nService.getCurrentLanguage$().subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  setLanguage(language: string): void {
    this.i18nService.setLanguage(language);
  }

  submit(): void {
    console.log('Form value:', this.form.value);
  }

  onJsonChange(json: JSONContent): void {
    this.editorJson = json;
  }

  onFocus(): void {
    this.editorFocused = true;
  }

  onBlur(): void {
    this.editorFocused = false;
  }

  selectTab(tab: Tab): void {
    this.activeTab = tab;
  }
}
