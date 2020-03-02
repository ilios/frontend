import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import preloadCourse from 'ilios-common/utils/preload-course';

export default Mixin.create({
  currentUser: service(),
  titleToken: 'general.coursesAndSessions',
  canViewUnpublished: false,
  // only allow privileged users to view unpublished courses
  async afterModel(course, transition) {
    const currentUser = this.get('currentUser');
    const canViewUnpublished = currentUser.get('performsNonLearnerFunction');
    this.set('canViewUnpublished', canViewUnpublished);
    if (canViewUnpublished || course.get('isPublishedOrScheduled')) {
      return await preloadCourse(this.store, course);
    }

    transition.abort();
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canViewUnpublished', this.get('canViewUnpublished'));
  },
});
