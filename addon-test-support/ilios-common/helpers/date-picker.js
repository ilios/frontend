import { findOne } from 'ember-cli-page-object/extend';
import { click } from '@ember/test-helpers';
import { Interactor as Pikaday } from 'ember-pikaday/test-support';

export function datePicker(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (newDate) {
        const element = findOne(this, selector, options);
        await click(element);
        await Pikaday.selectDate(newDate);
      };
    }
  };
}
