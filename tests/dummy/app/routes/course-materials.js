import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import CourseMaterialsRouteMixin from 'ilios-common/mixins/course-materials-route';

export default Route.extend(AuthenticatedRouteMixin, CourseMaterialsRouteMixin, {
});
