import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default class DashboardRoute extends Route {
  @service store;
  @service currentUser;
  @service session;
  @service dataLoader;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return hash({
      schools: this.store.findAll('school'),
      academicYears: this.dataLoader.loadAcademicYears(),
    });
  }
}
