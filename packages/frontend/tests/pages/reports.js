import { create, visitable } from 'ember-cli-page-object';
// import root from './components/reports/root';

const page = {
  visit: visitable('/reports'),
  // root,
};

export default create(page);
