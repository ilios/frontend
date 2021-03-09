import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ProgramsRoute extends Route {
  @service currentUser;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const user = await this.currentUser.getModel();
    return hash({
      schools: this.store.findAll('school'),
      primarySchool: user.school,
    });
  }
}
