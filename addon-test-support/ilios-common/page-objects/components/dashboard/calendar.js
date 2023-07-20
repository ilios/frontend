import { create } from 'ember-cli-page-object';
import weeklyCalendar from './../weekly-calendar';
import dailyCalendar from './../daily-calendar';
import weekGlance from './../week-glance';

const definition = {
  scope: '[data-test-dashboard-calendar]',
  dailyCalendar,
  weekGlance,
  weeklyCalendar,
};

export default definition;
export const component = create(definition);
