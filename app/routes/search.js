import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  iliosConfig: service(),

  async beforeModel() {
    const searchEnabled = await this.iliosConfig.searchEnabled;
    if (!searchEnabled || !this.currentUser.performsNonLearnerFunction) {
      this.transitionTo('dashboard');
    }
  }
});
