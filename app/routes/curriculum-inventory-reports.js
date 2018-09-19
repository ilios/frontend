import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),
  titleToken: 'general.curriculumInventoryReports',

  async model() {
    const store = this.store;
    return store.findAll('school');
  },
});
