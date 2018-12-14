import {
  create,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-week-glance-pre-work]',
  title: text('[data-test-event-title]'),
  date: text('[data-test-date]'),
};

export default definition;
export const component = create(definition);
