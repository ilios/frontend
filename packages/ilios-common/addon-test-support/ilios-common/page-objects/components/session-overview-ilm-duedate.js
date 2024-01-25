import { create, clickable, isVisible, text } from 'ember-cli-page-object';
import datePicker from './date-picker';
import timePicker from './time-picker';

const definition = {
  scope: '[data-test-session-overview-ilm-duedate]',
  label: text('label'),
  value: text('span', { at: 0 }),
  edit: clickable('[data-test-edit]'),
  isEditable: isVisible('[data-test-edit]'),
  datePicker,
  timePicker,
  save: clickable('.done'),
  cancel: clickable('.cancel'),
  hasError: isVisible('.validation-error-message'),
};

export default definition;
export const component = create(definition);
