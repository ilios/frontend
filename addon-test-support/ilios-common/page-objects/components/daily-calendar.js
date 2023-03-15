import { create, collection, text, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-daily-calendar]',
  longDayOfWeek: text('[data-test-day-of-week] [data-test-long]'),
  shortDayOfWeek: text('[data-test-day-of-week] [data-test-short]'),
  events: collection('[data-test-daily-calendar-event]', {
    name: text('[data-test-name]'),
  }),
  hasNoEvents: isPresent('[data-test-no-events]'),
};

export default definition;
export const component = create(definition);
