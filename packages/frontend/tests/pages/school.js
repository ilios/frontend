import { create, visitable } from 'ember-cli-page-object';
import manager from './components/school-manager';

export default create({
  visit: visitable('/schools/:schoolId'),
  manager,
});
