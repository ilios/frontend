import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import VisualizationsRouteMixin from 'ilios-common/mixins/course-visualize-instructors-route';

export default Route.extend(AuthenticatedRouteMixin, VisualizationsRouteMixin, {
});
