import { findElementWithAssert } from 'ember-cli-page-object/extend';
import { settled } from '@ember/test-helpers';
import $ from 'jquery';

import { fillInFroalaEditor as froalaHelper } from 'ember-froala-editor/test-support';

export function fillInFroalaEditor(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (html) {
        const element = findElementWithAssert(this, selector, options);
        const $editor = $(element);
        froalaHelper($editor, html);

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
