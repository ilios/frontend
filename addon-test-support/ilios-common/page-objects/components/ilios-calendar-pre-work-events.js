import { collection, create, text } from 'ember-cli-page-object';
import item from './ilios-calendar-pre-work-event';

const definition = {
  scope: '[data-test-ilios-calendar-prework-events]',
  title: text('[data-test-title]'),
  events: collection('[data-test-ilios-calendar-pre-work-event]', {
    item,
  }),
};

export default definition;
export const component = create(definition);
