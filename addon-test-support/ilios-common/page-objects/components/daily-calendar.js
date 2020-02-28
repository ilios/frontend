import {
  create,
  collection,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-daily-calendar]',
  longDayOfWeek: text('[data-test-day-of-week] [data-test-long]'),
  shortDayOfWeek: text('[data-test-day-of-week] [data-test-short]'),
  events: collection('[data-test-daily-calendar-event]', {
    name: text('[data-test-name]'),
  }),
};

export default definition;
export const component = create(definition);
