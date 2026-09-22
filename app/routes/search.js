import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SearchRoute extends Route {
  @service currentUser;
  @service iliosConfig;
  @service store;
  @service router;

  async beforeModel(transition) {
    const searchEnabled = await this.iliosConfig.getSearchEnabled();
    if (!searchEnabled || !this.currentUser.requireNonLearner(transition)) {
      this.router.transitionTo('dashboard');
    }
  }

  async afterModel() {
    //preload all schools
    return this.store.findAll('school');
  }
}
