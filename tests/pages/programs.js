import { create, visitable } from 'ember-cli-page-object';
import root from './components/programs/root';

const programs = {
  visit: visitable('/programs'),
  root,
};

export default create(programs);
