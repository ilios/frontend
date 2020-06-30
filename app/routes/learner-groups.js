import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  dataLoader: service(),

  queryParams: {
    titleFilter: {
      replace: true
    }
  },

  model() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  },

  actions: {
    willTransition() {
      this.controller.set('newGroup', null);
    }
  }
});
