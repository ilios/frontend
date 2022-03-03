import { create, visitable } from 'ember-cli-page-object';
import calendar from './components/dashboard-calendar';

export default create({
  visit: visitable('/dashboard/calendar'),
  calendar,
});
