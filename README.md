# tiptap-ng

Componente Angular (`<app-editor>`) de editor de texto rico sobre o
[@kelsoncm/tiptap-core](https://github.com/kelsoncm/tiptap-core). Integra com Reactive Forms e
`ngModel` (valor = HTML), traduz com ngx-translate e usa o GOV.BR Design System e Font Awesome.

Os recursos (barra, balão, modos, tabelas, mídia, menções, merge fields, revisão, verificadores,
exportação...) vêm do core; este projeto é a camada Angular e um app de demonstração.

## Requisitos

- Angular 22, TypeScript 6.0, Node 22+.
- `@kelsoncm/tiptap-core` instalado pelo tarball da release (veja `.npmrc`: `allow-remote=root`,
  exigido pelo npm 12 para dependências por URL).

## Uso

```ts
import { EditorComponent } from './shared/editor';

@Component({
  imports: [ReactiveFormsModule, EditorComponent],
  template: `
    <app-editor
      formControlName="body"
      toolbarPreset="full"
      mode="toolbar"
      [wordLimit]="200"
      [wordMinimum]="10"
      [mentionItems]="campos"
      [options]="{ media: { upload: enviar } }"
      (jsonChange)="json = $event"
    ></app-editor>
  `,
})
```

### Inputs

| Input | Padrão | Descrição |
|---|---|---|
| `toolbarPreset` | `full` | `minimal`, `basic` ou `full`. |
| `mode` | `toolbar` | `toolbar`, `balloon`, `inline`, `notion`, `readonly`. |
| `readonly` | `false` | Somente leitura (também com `control.disable()`). |
| `placeholder` | `editor.placeholders.default` | Chave do ngx-translate ou texto. |
| `minHeight`, `maxHeight` | `200px`, — | Altura do conteúdo. |
| `enableBold`, `enableItalic`, `enableStrike`, `enableCode`, `enableHeading` | `true` | Botões/recursos de formatação. |
| `enableSubscript`, `enableSuperscript`, `enableLineHeight`, `enableFontFamily`, `enableFontSize`, `enableTextColor`, `enableHighlight`, `enableTextAlign`, `enableTable`, `enablePageBreak` | `true` | Recursos opcionais do core. |
| `enableTableOfContents` | `false` | Ids nos títulos e links no sumário. |
| `enableBalloonMenu` | `true` | Balão sobre a seleção. |
| `enableMention`, `mentionItems` | `true`, campos do edital | Menções com `@`. |
| `showFooter` | `true` | Barra de status (contadores, limites). |
| `characterLimit/Minimum`, `wordLimit/Minimum`, `paragraphLimit/Minimum` | — | Máximos aplicados e mínimos informados. |
| `cleanListParagraphs` | `true` | Salva `<li>texto</li>` (sem `<p>`), como a versão anterior. |
| `options` | `{}` | Qualquer opção do `createEditorUI` do core (mídia, revisão, verificadores, plugins...). |

Mudar `mode` ou `readonly` não recria o editor; os demais inputs recriam mantendo o conteúdo.

### Outputs

`htmlChange`, `jsonChange`, `focus`, `blur`, `ready` (instância `EditorUI` do core, também em
`component.editor`).

### Idioma

O idioma do ngx-translate (`pt_br`, `en`, `es`) é repassado ao core (`pt-BR`, `en`, `es`) e acompanha
`translate.use()`.

## Desenvolvimento

```bash
npm ci
npm start        # http://localhost:4200
npm run lint
npm test         # Vitest (builder @angular/build:unit-test)
npm run build
```

## Licença

[MIT](LICENSE)
