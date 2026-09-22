import { collection, create, text } from 'ember-cli-page-object';
import weekGlanceEvent from './week-glance-event';

const definition = {
  scope: '[data-test-week-glance]',
  title: text('[data-test-week-title]'),
  eventsByDate: collection('[data-test-events-by-date]', {
    events: collection('[data-test-week-glance-event]', weekGlanceEvent),
    days: collection('[data-test-day]'),
  }),
};

export default definition;
export const component = create(definition);
