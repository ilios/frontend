import {
  create,
  visitable,
} from 'ember-cli-page-object';
import weeklyCalendar from './components/weekly-calendar';

export default create({
  scope: '[data-test-common-dashboard]',
  visit: visitable('/dashboard'),
  weeklyCalendar,
});
