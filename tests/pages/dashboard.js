import { create, visitable } from 'ember-cli-page-object';
import myReports from './components/dashboard-myreports';
import iliosHeader from 'ilios/tests/pages/components/ilios-header';

export default create({
  visit: visitable('/dashboard'),
  iliosHeader,
  myReports,
});
