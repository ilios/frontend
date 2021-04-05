import {
  create,
  collection,
  hasClass,
  fillable,
  isPresent,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-pending-updates-summary]',
  title: text('[data-test-title]'),
  summary: text('[data-test-summary]'),
  hasAlert: hasClass('alert'),
  schoolFilter: {
    scope: '[data-test-schools]',
    set: fillable('select'),
    hasMultiple: isPresent(' select'),
    selected: value('select'),
    options: collection('option'),
  },
};

export default definition;
export const component = create(definition);
