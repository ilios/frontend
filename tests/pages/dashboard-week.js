import { create, visitable } from 'ember-cli-page-object';

import navigation from './components/dashboard/navigation';
import week from './components/dashboard/week';

export default create({
  visit: visitable('/dashboard/week'),
  navigation,
  week,
});
