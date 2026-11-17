import { create, visitable } from 'ember-cli-page-object';

import backToAdminDashboard from './components/back-to-admin-dashboard';
import root from './components/ilios-users';

export default create({
  visit: visitable('/users'),
  backToAdminDashboard,
  root,
});
