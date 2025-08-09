import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ProgramPublicationCheckRoute extends Route {
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async afterModel(model) {
    await model.get('programYears');
  }
}
