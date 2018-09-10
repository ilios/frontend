import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import PrintCourseRouteMixin from 'ilios-common/mixins/print-course-route';

export default Route.extend(AuthenticatedRouteMixin, PrintCourseRouteMixin, {
});
