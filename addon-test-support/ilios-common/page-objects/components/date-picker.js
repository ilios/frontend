import { create, value } from 'ember-cli-page-object';
import { flatpickrDatePicker } from 'ilios-common';

const definition = {
  scope: '[data-test-date-picker]',
  set: flatpickrDatePicker(),
  value: value(),
};

export default definition;
export const component = create(definition);
