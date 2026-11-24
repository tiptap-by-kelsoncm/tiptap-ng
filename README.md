# tiptap-ng

Biblioteca Angular `@kelsoncm/tiptap-ng`: componente `<kt-editor>` de editor de texto rico sobre o
[@kelsoncm/tiptap-core](https://github.com/tiptap-by-kelsoncm/tiptap-core). Integra com Reactive Forms e
`ngModel` (valor = HTML), traduz com ngx-translate e usa o GOV.BR Design System e Font Awesome.

Os recursos (barra, balão, modos, tabelas, mídia, menções, merge fields, revisão, verificadores,
exportação...) vêm do core; este projeto é a camada Angular (pasta `projects/tiptap-ng`) e um app de
demonstração (pasta `src`).

## Instalação

```bash
npm install @kelsoncm/tiptap-ng @kelsoncm/tiptap-core @tiptap/core @tiptap/pm @ngx-translate/core
```

- Angular 22, TypeScript 6.0, Node 22+.
- CSS do core em `styles` do `angular.json`: `node_modules/@kelsoncm/tiptap-core/dist/styles/kelson-editor.css`.
- Ícones padrão do Font Awesome (`@fortawesome/fontawesome-free`); troque com `[options]="{ renderIcon }"`.
- O provider do ngx-translate é opcional; sem ele, o core traduz a interface sozinho.

## Uso

```ts
import { EditorComponent } from '@kelsoncm/tiptap-ng';

@Component({
  imports: [ReactiveFormsModule, EditorComponent],
  template: `
    <kt-editor
      formControlName="body"
      toolbarPreset="full"
      mode="toolbar"
      [wordLimit]="200"
      [wordMinimum]="10"
      [mentionItems]="campos"
      [options]="{ media: { upload: enviar } }"
      (jsonChange)="json = $event"
    ></kt-editor>
  `,
})
```

O seletor `<app-editor>` continua aceito, para apps escritos antes da biblioteca.

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
npm start          # app de demonstração em http://localhost:4200
npm run lint
npm test           # Vitest (builder @angular/build:unit-test)
npm run build:lib  # biblioteca em dist/tiptap-ng
npm run build      # biblioteca e app de demonstração
```

## Publicação

O workflow `release.yml` roda ao enviar uma tag `vX.Y.Z` (igual à versão de `package.json` e de
`projects/tiptap-ng/package.json`): cria a release com o tarball e publica `dist/tiptap-ng` no npm com
provenance, por *Trusted Publishing* (OIDC). O secret `NPM_TOKEN` é só reserva.

## Licença

[MIT](LICENSE)
