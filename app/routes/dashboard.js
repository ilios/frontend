import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class DashboardRoute extends Route {
  @service store;
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login-error');
  }

  async model() {
    return hash({
      schools: this.store.findAll('school'),
      academicYears: this.store.findAll('academic-year'),
    });
  }
}
