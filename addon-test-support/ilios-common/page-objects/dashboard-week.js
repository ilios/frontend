import { create, visitable } from 'ember-cli-page-object';
import week from './components/dashboard-week';

export default create({
  visit: visitable('/dashboard/week'),
  week,
});
