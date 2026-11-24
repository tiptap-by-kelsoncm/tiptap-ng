# @kelsoncm/tiptap-ng

Componente Angular (`<kt-editor>`) de editor de texto rico sobre o
[@kelsoncm/tiptap-core](https://www.npmjs.com/package/@kelsoncm/tiptap-core). Integra com Reactive Forms e
`ngModel` (valor = HTML) e, se presente, com o ngx-translate.

Exemplos ao vivo e documentação: <https://tiptap-by-kelsoncm.github.io/tiptap-core/docs/angular.html>

## Instalação

```bash
npm install @kelsoncm/tiptap-ng @kelsoncm/tiptap-core @tiptap/core @tiptap/pm @ngx-translate/core
```

Requer Angular 22. O pacote `@ngx-translate/core` precisa estar instalado, mas configurar o provider é
opcional: sem ele, o core traduz a interface sozinho.

Inclua o CSS do core (por exemplo, em `styles` do `angular.json`):

```json
"styles": ["node_modules/@kelsoncm/tiptap-core/dist/styles/kelson-editor.css", "src/styles.scss"]
```

Os ícones padrão são classes do Font Awesome; troque por outros com `[options]="{ renderIcon }"`.

## Uso

```ts
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { EditorComponent } from "@kelsoncm/tiptap-ng";

@Component({
  selector: "app-root",
  imports: [ReactiveFormsModule, EditorComponent],
  template: `<kt-editor [formControl]="body" toolbarPreset="full" [wordLimit]="200"></kt-editor>`,
})
export class AppComponent {
  body = new FormControl("<p>Olá</p>");
}
```

O seletor `<app-editor>` também funciona, para apps escritos antes da biblioteca.

Inputs, outputs e idioma: veja o [README do repositório](https://github.com/tiptap-by-kelsoncm/tiptap-ng#readme).

## Licença

[MIT](https://github.com/tiptap-by-kelsoncm/tiptap-ng/blob/main/LICENSE)
