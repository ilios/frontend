import {
  attribute,
  create,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-week-glance-pre-work]',
  title: text('[data-test-event-title]'),
  date: text('[data-test-date]'),
  url: attribute('href', '[data-test-date] a'),
};

export default definition;
export const component = create(definition);
