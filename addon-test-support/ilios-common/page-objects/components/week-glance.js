import { collection, create, text } from 'ember-cli-page-object';
import weekGlanceEvent from './week-glance-event';

const definition = {
  scope: '[data-test-week-glance]',
  title: text('[data-test-week-title]'),
  events: collection('[data-test-week-glance-event]', weekGlanceEvent),
};

export default definition;
export const component = create(definition);
