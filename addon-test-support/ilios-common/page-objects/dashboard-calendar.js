import { create, visitable } from 'ember-cli-page-object';
import calendar from './components/dashboard/calendar';
import navigation from './components/dashboard/navigation';

export default create({
  visit: visitable('/dashboard/calendar'),
  navigation,
  calendar,
});
