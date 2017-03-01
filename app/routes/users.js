import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.admin',
  setupController(controller){
    controller.get('searchForUsers').perform();
  },
  queryParams: {
    query: {
      replace: true
    },
    searchTerms: {
      replace: true
    }
  }
});
