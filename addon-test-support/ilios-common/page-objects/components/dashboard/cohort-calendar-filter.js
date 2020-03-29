import {
  collection,
  clickable,
  create,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-cohort-calendar-filter]',
  cohorts: collection('[data-test-cohort]', {
    title: text(),
    toggle: clickable('[data-test-target]'),
    isChecked: property('checked', '[data-test-target] input'),
  }),
};

export default definition;
export const component = create(definition);
