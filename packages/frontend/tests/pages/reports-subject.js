import { create, visitable } from 'ember-cli-page-object';
import report from './components/reports/subject';

const page = {
  visit: visitable('/reports/subjects/:reportId'),
  report,
};

export default create(page);
