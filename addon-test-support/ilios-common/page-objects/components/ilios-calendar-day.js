import { create } from 'ember-cli-page-object';
import calendar from './daily-calendar';
import prework from './ilios-calendar-pre-work-events';
import multiday from './ilios-calendar-multiday-events';

const definition = {
  scope: '[data-test-ilios-calendar-day]',
  calendar,
  prework,
  multiday,
};

export default definition;
export const component = create(definition);
