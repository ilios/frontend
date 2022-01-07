import { create } from 'ember-cli-page-object';
import calendar from './monthly-calendar';
import prework from './ilios-calendar-pre-work-events';
import multiday from './ilios-calendar-multiday-events';

const definition = {
  calendar,
  prework,
  multiday,
};

export default definition;
export const component = create(definition);
