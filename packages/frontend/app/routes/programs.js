import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProgramsRoute extends Route {
  @service currentUser;
  @service session;
  @service store;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async model() {
    return this.store.findAll('school', {
      include: 'programs.programYears.cohort',
      reload: true,
    });
  }
}
