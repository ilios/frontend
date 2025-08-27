import {
  attribute,
  clickable,
  create,
  fillable,
  isVisible,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-quill-html-editor]',
  toolbar: {
    scope: '[data-test-toolbar]',
    bold: isPresent('[data-test-toolbar-bold]'),
    italic: isPresent('[data-test-toolbar-italic]'),
    subscript: isPresent('[data-test-toolbar-subscript]'),
    superscript: isPresent('[data-test-toolbar-superscript]'),
    listOrdered: isPresent('[data-test-toolbar-list-ordered]'),
    listUnordered: isPresent('[data-test-toolbar-list-unordered]'),
    link: {
      scope: '[data-test-toolbar-link]',
      insertLink: clickable(),
    },
    undo: {
      scope: '[data-test-toolbar-undo]',
      disabled: attribute('disabled'),
      goBack: clickable(),
    },
    redo: {
      scope: '[data-test-toolbar-redo]',
      disabled: attribute('disabled'),
      goForward: clickable(),
    },
  },
  editor: {
    scope: '[data-test-html-editor]',
    edit: fillable('.ql-editor'),
    content: {
      scope: '.ql-editor',
      textContent: text(),
      htmlContent: property('innerHTML'),
    },
  },
  popup: {
    scope: '[data-test-insert-link-popup]',
    activated: isVisible(),
    form: {
      url: {
        scope: '[data-test-url]',
        edit: fillable(),
      },
      text: {
        scope: '[data-test-text]',
        edit: fillable(),
      },
      linkNewTarget: isPresent('[data-test-link-new-target]'),
      insert: {
        scope: '[data-test-submit]',
        submit: clickable(),
      },
    },
  },
};

export default definition;
export const component = create(definition);
