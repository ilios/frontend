import { findOne } from 'ember-cli-page-object/extend';
import { loadQuillEditor } from 'ilios-common/utils/load-quill-editor';
import { later } from '@ember/runloop';

export async function fillInQuillEditor(element, html) {
  const editor = await getEditorInstance(element);
  editor.setContents(editor.clipboard.convert({ html }));
}
export async function quillEditorValue(element) {
  const editor = await getEditorInstance(element);
  // easiest way to get the HTML in an editor, maintain multiple spaces, and make sure it's empty empty, as Quill leaves `<p><br></p>` even if the editor is "empty"
  // not using editor.getContents() as it returns custom Delta object that doesn't actually have the HTML markup: https://quilljs.com/docs/api#getcontents
  return editor.root.innerHTML.split('  ').join(' &nbsp;').replaceAll('<p><br></p>', '');
}

export function pageObjectFillInQuillEditor(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (html) {
        const element = findOne(this, selector, options);
        return fillInQuillEditor(element, html);
      };
    },
  };
}

export function pageObjectQuillEditorValue(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function () {
        const element = findOne(this, selector, options);
        return quillEditorValue(element);
      };
    },
  };
}

function getEditorInstance(element) {
  return new Promise((resolve) => {
    loadQuillEditor().then(({ QuillEditor }) => {
      // eslint-disable-next-line ember/no-runloop
      later(() => {
        const ourInstance = QuillEditor.find(document.querySelector(`#${element.id}`));
        resolve(ourInstance);
      });
    });
  });
}
