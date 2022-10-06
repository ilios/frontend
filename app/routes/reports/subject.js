import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ReportsSubjectRoute extends Route {
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord('report', params.report_id);
  }
}
