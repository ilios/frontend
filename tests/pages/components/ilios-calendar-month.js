import { create } from 'ember-cli-page-object';

import multiday from './ilios-calendar-multiday-events';
import calendar from './monthly-calendar';

const definition = {
  scope: '[data-test-ilios-calendar-month]',
  calendar,
  multiday,
};

export default definition;
export const component = create(definition);
