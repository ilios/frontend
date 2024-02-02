import { create, visitable } from 'ember-cli-page-object';
import week from './components/dashboard/week';
import navigation from './components/dashboard/navigation';

export default create({
  visit: visitable('/dashboard/week'),
  navigation,
  week,
});
