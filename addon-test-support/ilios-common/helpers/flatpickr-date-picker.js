import { findOne } from 'ember-cli-page-object/extend';

export function flatpickrDatePicker(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (newDate) {
        const element = findOne(this, selector, options);
        element._flatpickr.setDate(newDate, true);
      };
    }
  };
}
