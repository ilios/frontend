import { create, visitable } from 'ember-cli-page-object';
import details from './components/instructor-group/root';

export default create({
  visit: visitable('/instructorgroups/:instructorGroupId'),
  details,
});
