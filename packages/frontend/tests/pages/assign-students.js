import { create, visitable } from 'ember-cli-page-object';
import root from './components/assign-students/root';

export default create({
  visit: visitable('/admin/assignstudents'),
  root,
});
