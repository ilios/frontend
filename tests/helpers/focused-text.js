import { findOne } from 'ember-cli-page-object/extend';

export function focusedText(selector = null, userOptions = {}) {
  return {
    isDescriptor: true,

    get(key) {
      const options = { pageObjectKey: key, ...userOptions };
      const scope = findOne(this, selector, options);
      const active = document.activeElement;
      return scope && active && scope.contains(active) ? active.textContent.trim() : '';
    },
  };
}
