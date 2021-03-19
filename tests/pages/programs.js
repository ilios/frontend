import { create, visitable } from 'ember-cli-page-object';

import root from './components/programs/root';

const programs = {
  visit: visitable('/programs'),
};

export default create(Object.assign(root, programs));
