import { create } from 'ember-cli-page-object';
import calendar from './monthly-calendar';
import multiday from './ilios-calendar-multiday-events';

const definition = {
  scope: '[data-test-ilios-calendar-month]',
  calendar,
  multiday,
};

export default definition;
export const component = create(definition);
