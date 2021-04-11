import { create, visitable } from 'ember-cli-page-object';

import root from './components/instructor-groups/root';

const instructorGroups = {
  visit: visitable('/instructorgroups'),
};

export default create(Object.assign(root, instructorGroups));
