import { create } from 'ember-cli-page-object';
import calendar from './weekly-calendar';
import prework from './ilios-calendar-pre-work-events';
import multiday from './ilios-calendar-multiday-events';

const definition = {
  scope: '[data-test-ilios-calendar-week]',
  calendar,
  prework,
  multiday,
};

export default definition;
export const component = create(definition);
