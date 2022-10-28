import { create, visitable } from 'ember-cli-page-object';
import root from './components/learner-group/root';

export default create({
  visit: visitable('/learnergroups/:learnerGroupId'),
  root,
});
