import { create, visitable } from 'ember-cli-page-object';
import subjectReports from './components/reports/subjects';

const page = {
  visit: visitable('/reports'),
  subjectReports,
};

export default create(page);
