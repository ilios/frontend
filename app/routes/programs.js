import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProgramsRoute extends Route {
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
    return this.store.findAll('school', {
      include: 'programs.programYears.cohort',
      reload: true,
    });
  }
}
