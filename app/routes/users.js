import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.admin',
  queryParams: {
    query: {
      replace: true
    },
    searchTerms: {
      replace: true
    }
  }
});
