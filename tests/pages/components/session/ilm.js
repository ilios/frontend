import { clickable, create, fillable, hasClass, isVisible, text } from 'ember-cli-page-object';
import yesNoToggle from '../toggle-yesno';
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
  toggleIlm: {
    scope: '[data-test-ilm-value]',
    yesNoToggle,
  },
  isIlm: hasClass('add', '[data-test-ilm-value] span'),
};

export default definition;
export const component = create(definition);
