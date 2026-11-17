import { create } from 'ember-cli-page-object';

import multiday from './ilios-calendar-multiday-events';
import calendar from './weekly-calendar';

const definition = {
  scope: '[data-test-ilios-calendar-week]',
  calendar,
  multiday,
};

export default definition;
export const component = create(definition);
