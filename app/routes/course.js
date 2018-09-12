import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import CourseRouteMixin from 'ilios-common/mixins/course-route';

export default Route.extend(AuthenticatedRouteMixin, CourseRouteMixin, {
});
