import { create, visitable } from 'ember-cli-page-object';
import manageUsersSummary from './components/manage-users-summary';

export default create({
  visit: visitable('/admin'),
  manageUsersSummary,
});
