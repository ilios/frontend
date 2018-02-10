import Route from '@ember/routing/route';
import DashboardRoute from 'ilios-common/mixins/dashboard-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(DashboardRoute, AuthenticatedRouteMixin);
