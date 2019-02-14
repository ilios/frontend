import {
  create,
  visitable
} from 'ember-cli-page-object';
import myReports from 'ilios/tests/pages/components/dashboard-myreports';

export default create({
  scope: '[data-test-dashboard]',
  visit: visitable('/dashboard'),
  myReports,
});
