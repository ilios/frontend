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
    },
  };
}

export function flatpickrDateValue(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      const element = findOne(this, selector, options);
      const selectedDates = element._flatpickr.selectedDates;
      if (selectedDates.length) {
        return new Intl.DateTimeFormat('en-US').format(selectedDates[0]);
      }

      return null;
    },
  };
}
