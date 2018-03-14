import { findElementWithAssert } from 'ember-cli-page-object/extend';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

export function datePicker(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return function (newDate) {
        const elements = findElementWithAssert(this, selector, options);
        const interactor = openDatepicker(elements[0]);
        interactor.selectDate(newDate);
      };
    }
  };
}
