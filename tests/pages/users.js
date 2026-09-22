import { create, visitable } from 'ember-cli-page-object';
import root from './components/ilios-users';
import backToAdminDashboard from './components/back-to-admin-dashboard';

export default create({
  visit: visitable('/users'),
  backToAdminDashboard,
  root,
});
