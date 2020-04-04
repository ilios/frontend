import {
  collection,
  clickable,
  create,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-courses-calendar-filter]',
  years: collection('[data-test-year]', {
    title: text('[data-test-year-title]'),
    toggle: clickable('[data-test-year-title] button'),
    courses: collection('[data-test-course]', {
      title: text(),
      toggle: clickable('[data-test-target]'),
      isChecked: property('checked', '[data-test-target] input'),
    }),
  }),
};

export default definition;
export const component = create(definition);
