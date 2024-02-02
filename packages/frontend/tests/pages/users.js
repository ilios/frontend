import { create, visitable } from 'ember-cli-page-object';
import root from 'frontend/tests/pages/components/ilios-users';
import backToAdminDashboard from 'frontend/tests/pages/components/back-to-admin-dashboard';

export default create({
  visit: visitable('/users'),
  backToAdminDashboard,
  root,
});
