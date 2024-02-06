import { attribute, create, collection, text, isPresent } from 'ember-cli-page-object';
import ev from './daily-calendar-event';

const definition = {
  scope: '[data-test-daily-calendar]',
  ariaBusy: attribute('aria-busy'),
  title: {
    scope: '[data-test-day-of-week]',
    longDayOfWeek: text('[data-test-long]'),
    shortDayOfWeek: text('[data-test-short]'),
  },
  events: collection('[data-test-daily-calendar-event]', ev),
  hasNoEvents: isPresent('[data-test-no-events]'),
};

export default definition;
export const component = create(definition);
