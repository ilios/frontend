import { clickable, create, fillable, isPresent, text, value } from 'ember-cli-page-object';
import offeringForm from './offering-form';

const definition = {
  scope: '[data-test-sessions-grid-offering]',
  offeringForm,
  startTime: text('[data-test-starttime]'),
  duration: text('[data-test-duration]'),
  room: {
    scope: '[data-test-room]',
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isPresent('.editinplace'),
    value: value('input'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isPresent('[data-test-room-validation-error-message]'),
    error: text('[data-test-room-validation-error-message]'),
  },
  learners: text('[data-test-learners]'),
  learnerGroups: text('[data-test-learnergroups]'),
  instructors: text('[data-test-instructors]'),
  edit: {
    scope: '[data-test-actions] [data-test-edit]',
  },
};

export default definition;
export const component = create(definition);
