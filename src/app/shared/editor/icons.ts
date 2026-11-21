import { defaultIconRenderer, type IconRenderer } from '@kelsoncm/tiptap-core';

/** Core icon names -> Font Awesome 7 classes. Unknown icons fall back to the core text icons. */
const FONT_AWESOME: Readonly<Record<string, string>> = {
  undo: 'fa-solid fa-rotate-left',
  redo: 'fa-solid fa-rotate-right',
  bold: 'fa-solid fa-bold',
  italic: 'fa-solid fa-italic',
  underline: 'fa-solid fa-underline',
  strikethrough: 'fa-solid fa-strikethrough',
  code: 'fa-solid fa-code',
  'code-block': 'fa-solid fa-file-code',
  subscript: 'fa-solid fa-subscript',
  superscript: 'fa-solid fa-superscript',
  'remove-format': 'fa-solid fa-text-slash',
  quote: 'fa-solid fa-quote-left',
  'list-ul': 'fa-solid fa-list-ul',
  'list-ol': 'fa-solid fa-list-ol',
  'task-list': 'fa-solid fa-list-check',
  indent: 'fa-solid fa-indent',
  outdent: 'fa-solid fa-outdent',
  'align-left': 'fa-solid fa-align-left',
  'align-center': 'fa-solid fa-align-center',
  'align-right': 'fa-solid fa-align-right',
  'align-justify': 'fa-solid fa-align-justify',
  table: 'fa-solid fa-table',
  'horizontal-rule': 'fa-solid fa-minus',
  'page-break': 'fa-solid fa-scissors',
  link: 'fa-solid fa-link',
  unlink: 'fa-solid fa-link-slash',
  'open-link': 'fa-solid fa-arrow-up-right-from-square',
  anchor: 'fa-solid fa-anchor',
  image: 'fa-solid fa-image',
  upload: 'fa-solid fa-upload',
  gallery: 'fa-solid fa-images',
  attach: 'fa-solid fa-paperclip',
  media: 'fa-solid fa-photo-film',
  mention: 'fa-solid fa-at',
  emoji: 'fa-regular fa-face-smile',
  chart: 'fa-solid fa-chart-column',
  search: 'fa-solid fa-magnifying-glass',
  print: 'fa-solid fa-print',
  fullscreen: 'fa-solid fa-expand',
  source: 'fa-solid fa-code',
  comment: 'fa-regular fa-comment',
  'format-painter': 'fa-solid fa-paintbrush',
  mic: 'fa-solid fa-microphone',
  language: 'fa-solid fa-language',
  a11y: 'fa-solid fa-universal-access',
};

export const fontAwesomeIcon: IconRenderer = (icon, commandId) => {
  const classes = FONT_AWESOME[icon];
  if (!classes) return defaultIconRenderer(icon, commandId);
  const element = document.createElement('i');
  element.className = classes;
  element.setAttribute('aria-hidden', 'true');
  return element;
};
