import { create, visitable } from 'ember-cli-page-object';
import details from './components/instructorgroup-details';

export default create({
  visit: visitable('/instructorgroups/:instructorGroupId'),
  details,
});
