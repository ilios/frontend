import { findElementWithAssert } from 'ember-cli-page-object/extend';
import { settled } from '@ember/test-helpers';
import $ from 'jquery';
import { run } from '@ember/runloop';

export function fillInFroalaEditor(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (html) {
        const element = findElementWithAssert(this, selector, options);
        const $editor = $(element);

        // Apply html via Froala Editor method and trigger a change event
        run(() => {
          $editor.froalaEditor('html.set', `${html}`);
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
      const element = findElementWithAssert(this, selector, options);
      const $editor = $(element);
      return $editor.froalaEditor('html.get');
    }
  };
}
