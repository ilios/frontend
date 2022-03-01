import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class DashboardCalendarRoute extends Route {
  @service store;
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return hash({
      schools: this.store.findAll('school'),
      academicYears: this.store.findAll('academic-year'),
    });
  }
}
