import { collection, create, text } from 'ember-cli-page-object';
import item from './ilios-calendar-multiday-event';

const definition = {
  scope: '[data-test-ilios-calendar-multiday-events]',
  title: text('[data-test-title]'),
  events: collection('[data-test-ilios-calendar-multiday-event]', {
    item,
  }),
};

export default definition;
export const component = create(definition);
