import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import DashboardRoute from 'ilios-common/mixins/dashboard-route';

export default Route.extend(AuthenticatedRouteMixin, DashboardRoute, {
});
