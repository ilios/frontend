import {
  create,
  visitable,
} from 'ember-cli-page-object';
import weeklyCalendar from './components/weekly-calendar';
import dailyCalendar from './components/daily-calendar';
import weekGlance from './components/week-glance';

export default create({
  scope: '[data-test-common-dashboard]',
  visit: visitable('/dashboard'),
  weeklyCalendar,
  dailyCalendar,
  weekGlance,
});
