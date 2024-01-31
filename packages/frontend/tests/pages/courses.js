import { create, visitable } from 'ember-cli-page-object';

import root from './components/courses/root';

export default create({
  visit: visitable('/courses'),
  root,
});
