import { create } from 'ember-cli-page-object';
import { flatpickrDatePicker, flatpickrDateValue } from 'frontend/tests/helpers';

const definition = {
  scope: '[data-test-date-picker]',
  set: flatpickrDatePicker(),
  value: flatpickrDateValue(),
};

export default definition;
export const component = create(definition);
