import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),

  async model() {
    const store = this.store;
    return store.findAll('school');
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('sortByTitle', ['title']);
  }
});
