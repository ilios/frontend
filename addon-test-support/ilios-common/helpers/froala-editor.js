import { findElementWithAssert } from 'ember-cli-page-object/extend';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';
import { later } from '@ember/runloop';

export async function fillInFroalaEditor(element, html) {
  const editor = await getEditorInstance(element);
  editor.html.set(html);
  editor.undo.saveStep();
}
export async function froalaEditorValue(element) {
  const editor = await getEditorInstance(element);
  return editor.html.get();
}

export function pageObjectFillInFroalaEditor(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (html) {
        const elements = findElementWithAssert(this, selector, options);
        return fillInFroalaEditor(elements[0], html);
      };
    }
  };
}

export function pageObjectFroalaEditorValue(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function () {
        const elements = findElementWithAssert(this, selector, options);
        return froalaEditorValue(elements[0]);
      };
    }
  };
}

function getEditorInstance(element) {
  return new Promise(resolve => {
    loadFroalaEditor().then(({ FroalaEditor }) => {
      later(() => {
        const { INSTANCES } = FroalaEditor;
        const ourInstance = INSTANCES.find(instance => {
          const instanceElement = instance['$oel'][0];
          return instanceElement.id === element.id;
        });
        resolve(ourInstance);
      });
    });
  });
}
