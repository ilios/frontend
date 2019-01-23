import {
  attribute,
  create,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-ilios-calendar-pre-work-event]',
  title: text('[data-test-event-title]'),
  titleUrl: attribute('href', '[data-test-event-title] a'),
  date: text('[data-test-date]'),
  url: attribute('href', '[data-test-date] a'),
};

export default definition;
export const component = create(definition);
