import { findOne } from 'ember-cli-page-object/extend';
import { settled } from '@ember/test-helpers';

export function flatpickrDatePicker(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (newDate) {
        const element = findOne(this, selector, options);
        element._flatpickr.setDate(newDate, true);
        // the onChange from flatpicker doesn't track the ember runloop so we have
        // to manually call settled to ensure test doesn't continue until it is set
        await settled();
      };
    }
  };
}
