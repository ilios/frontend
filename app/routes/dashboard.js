import Ember from "ember";
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import DashboardRoute from 'ilios-common/mixins/dashboard-route';

const { Route } = Ember;

export default Route.extend(DashboardRoute, AuthenticatedRouteMixin, {
  titleToken: 'general.dashboard',
});
