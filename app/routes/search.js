import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  features: service(),
  beforeModel() {
    if (!this.features.get('globalSearch')) {
      this.transitionTo('dashboard');
    }
  },
});
