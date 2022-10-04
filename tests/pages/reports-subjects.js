import { create, visitable } from 'ember-cli-page-object';
import reports from './components/reports/subjects';

const page = {
  visit: visitable('/reports/subjects'),
  reports,
};

export default create(page);
