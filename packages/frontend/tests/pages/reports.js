import { create, visitable } from 'ember-cli-page-object';
import subjects from './components/reports/subjects-list';
import switcher from './components/reports/switcher';
import curriculum from './components/reports/curriculum';

const page = {
  visit: visitable('/reports'),
  visitCurriculumReports: visitable('/reports/curriculum'),
  switcher,
  subjects,
  curriculum,
};

export default create(page);
