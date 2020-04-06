import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import preloadCourse from 'ilios-common/utils/preload-course';

export default class PrintCourseRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;

  titleToken = 'general.coursesAndSessions';
  canViewUnpublished = false;

  // only allow privileged users to view unpublished courses
  async afterModel(course, transition) {
    this.canViewUnpublished = this.currentUser.performsNonLearnerFunction;
    if (this.canViewUnpublished || course.isPublishedOrScheduled) {
      return await preloadCourse(this.store, course);
    }

    transition.abort();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canViewUnpublished', this.get('canViewUnpublished'));
  }
}
