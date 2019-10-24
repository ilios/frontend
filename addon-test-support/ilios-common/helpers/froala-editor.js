import { buildSelector } from 'ember-cli-page-object';
import FroalaEditor from 'froala-editor';

function getEditorInstance(selector) {
  return new Promise(resolve => {
    const editor = new FroalaEditor(selector, {}, () => {
      resolve(editor);
    });
  });
}
export function fillInFroalaEditor(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (html) {
        const fullSelector = buildSelector(this, selector, options);
        const editor = await getEditorInstance(fullSelector);
        editor.html.set(html);
      };
    }
  };
}

export function froalaEditorValue(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function () {
        const fullSelector = buildSelector(this, selector, options);
        const editor = await getEditorInstance(fullSelector);
        return editor.html.get();
      };
    }
  };
}
