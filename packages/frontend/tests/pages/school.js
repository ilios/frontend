import { create, visitable } from 'ember-cli-page-object';
import root from './components/school/root';

export default create({
  visit: visitable('/schools/:schoolId'),
  root,
});
