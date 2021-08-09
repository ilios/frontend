import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SearchRoute extends Route {
  @service currentUser;
  @service iliosConfig;
  @service session;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    const searchEnabled = await this.iliosConfig.getSearchEnabled();
    if (!searchEnabled || !this.currentUser.performsNonLearnerFunction) {
      this.transitionTo('dashboard');
    }
  }
}
