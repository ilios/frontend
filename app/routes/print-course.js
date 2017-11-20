import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  titleToken: 'general.coursesAndSessions',
  // only allow privileged users to view unpublished courses
  async afterModel(course, transition){
    if (course.get('isPublishedOrScheduled')) {
      return this.preloadCourseData(course);
    }
    const currentUser = this.get('currentUser');
    const hasRole = await all([
      currentUser.get('userIsCourseDirector'),
      currentUser.get('userIsFaculty'),
      currentUser.get('userIsDeveloper'),
    ]);
    if (!hasRole.includes(true)) {
      transition.abort();
    } else {
      return this.preloadCourseData(course);
    }
  },
  async preloadCourseData(course){
    return all([
      course.get('sessions'),
      course.get('competencies'),
      course.get('objectives'),
    ]);
  }
});
