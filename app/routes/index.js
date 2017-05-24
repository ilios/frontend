import Ember from "ember";
import DashboardRoute from 'ilios-common/mixins/dashboard-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(DashboardRoute, AuthenticatedRouteMixin);
