import { create, visitable } from 'ember-cli-page-object';
import subjects from './components/reports/subjects-list';
import switcher from './components/reports/switcher';

const page = {
  visit: visitable('/reports'),
  switcher,
  subjects,
};

export default create(page);
