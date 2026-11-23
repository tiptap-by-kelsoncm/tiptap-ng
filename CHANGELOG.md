# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [0.1.3] - 2026-11-23

### Alterado

- Repositório transferido para a organização `tiptap-by-kelsoncm`: homepage, repositório e links atualizados.
- `@kelsoncm/tiptap-core` 0.18.1 (tarball da release na organização nova): bundle UMD, opção `contentLanguage` e correções desde a 0.15.2.

## [0.1.2] - 2026-11-23

### Alterado

- `@kelsoncm/tiptap-core` 0.15.2: KaTeX fixado em `^0.18.11` (compatível com `@tiptap/extension-mathematics`).

## [0.1.1] - 2026-11-21

### Alterado

- `@kelsoncm/tiptap-core` 0.15.1: instalar o tarball não dispara mais o aviso de script bloqueado do npm 12.

## [0.1.0] - 2026-11-21

### Alterado

- `<app-editor>` reescrito como camada fina sobre `@kelsoncm/tiptap-core` 0.15.0 (`createEditorUI`), mantendo inputs e outputs anteriores; novos inputs `mode`, `readonly`, `maxHeight`, `cleanListParagraphs`, `options` e outputs `htmlChange`, `ready`.
- Angular alinhado na versão 22.3 (antes 17 e 21 misturados), TypeScript 6.0, builders `@angular/build`, ngx-translate 18.
- Testes com Vitest (`@angular/build:unit-test`) e lint com angular-eslint; CI no GitHub Actions.
- Ícones do core renderizados com Font Awesome (empacotado, sem CDN).
- HTML salvo sem o parágrafo vazio final que o editor mantém após tabelas/listas.

### Corrigido

- Títulos 4–6, atributos de célula, legenda de tabela, abertura dupla do diálogo de link e Tab em tabelas (via core).
- `dependabot.yml` inválido; spec desatualizada do app.

### Removido

- Extensões locais (`src/app/shared/editor/extensions`), componente duplicado `src/app/editor`, dependências diretas de Tiptap/ProseMirror/tippy.js e documentos de recursos da implementação antiga (agora no README do core).
