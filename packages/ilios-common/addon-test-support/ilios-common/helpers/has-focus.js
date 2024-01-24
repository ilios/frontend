import { findOne } from 'ember-cli-page-object/extend';

export function hasFocus(selector, userOptions = {}) {
  return {
    isDescriptor: true,

    get(key) {
      let options = { pageObjectKey: key, ...userOptions };

      const element = findOne(this, selector, options);

      //check that the selected element is the "active" one (has focus)
      return element === document.activeElement;
    },
  };
}
