import { findElementWithAssert } from 'ember-cli-page-object/extend';
import { settled } from '@ember/test-helpers';
import { run } from '@ember/runloop';

export function fillInFroalaEditor(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (html) {
        const $editor = findElementWithAssert(this, selector, options);
        
        // Convert SafeStrings to regular string
        html = (
          html && typeof html.toString === 'function' ?
            html.toString() :
            ''
        );

        // Apply html via Froala Editor method and trigger a change event
        run(() => {
          $editor.froalaEditor('html.set', html);
          $editor.froalaEditor('undo.saveStep');
        });

        return settled();
      };
    }
  };
}

export function froalaEditorValue(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      const editor = findElementWithAssert(this, selector, options);
      return editor.froalaEditor('html.get');
    }
  };
}
