import { clickable, create, fillable, hasClass, isVisible, text } from 'ember-cli-page-object';
import ilmDueDateAndTime from '../session-overview-ilm-duedate';

const definition = {
  ilmHours: {
    scope: '[data-test-ilm-hours]',
    value: text('span', { at: 0 }),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message'),
  },
  ilmDueDateAndTime,
  addIlm: clickable('[data-test-add]'),
  removeIlm: clickable('[data-test-remove]'),
  canAdd: isVisible('[data-test-add]'),
  canRemove: isVisible('[data-test-remove]'),
  message: text('[data-test-message]'),
  confirmationMessage: {
    scope: '[data-test-confirmation-message]',
  },
  confirm: clickable('[data-test-confirm]'),
  cancel: clickable('[data-test-cancel]'),
  undo: clickable('[data-test-undo]'),
  isIlm: hasClass('is-ilm', '[data-test-session-ilm]'),
};

export default definition;
export const component = create(definition);
