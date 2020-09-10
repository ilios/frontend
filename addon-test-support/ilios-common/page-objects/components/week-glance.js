import {
  collection,
  create,
  text
} from 'ember-cli-page-object';
import weekGlanceEvent from './week-glance-event';
import weekGlancePreWork from './week-glance-pre-work';

const definition = {
  scope: '[data-test-week-glance]',
  title: text('[data-test-week-title]'),
  offeringEvents: collection('[data-test-week-glance-event]', weekGlanceEvent),
  ilmEvents: collection('[data-test-ilm-events] [data-test-week-glance-event]', weekGlanceEvent),
  preWork: collection('[data-test-ilm-pre-work] [data-test-week-glance-pre-work]', weekGlancePreWork),
};

export default definition;
export const component = create(definition);
