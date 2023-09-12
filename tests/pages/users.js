import { create, visitable } from 'ember-cli-page-object';
import root from 'ilios/tests/pages/components/ilios-users';
import backToAdminDashboard from 'ilios/tests/pages/components/back-to-admin-dashboard';

export default create({
  visit: visitable('/users'),
  backToAdminDashboard,
  root,
});
