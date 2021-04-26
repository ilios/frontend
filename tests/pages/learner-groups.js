import { create, visitable } from 'ember-cli-page-object';

import root from './components/learner-groups/root';

const learnerGroups = {
  visit: visitable('/learnergroups'),
};

export default create(Object.assign(root, learnerGroups));
