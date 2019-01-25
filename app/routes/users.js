/* eslint ember/order-in-routes: 0 */
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  queryParams: {
    query: {
      replace: true
    },
    searchTerms: {
      replace: true
    }
  }
});
