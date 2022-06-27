import { create, visitable } from 'ember-cli-page-object';
import details from './components/learnergroup-summary';

export default create({
  visit: visitable('/learnergroups/:learnerGroupId'),
  details,
});
