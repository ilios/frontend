import Mixin from '@ember/object/mixin';
import { all }  from 'rsvp';
import { inject as service } from '@ember/service';

export default Mixin.create({
  currentUser: service(),
  titleToken: 'general.coursesAndSessions',
  canViewUnpublished: false,
  // only allow privileged users to view unpublished courses
  async afterModel(course, transition) {
    const currentUser = this.get('currentUser');
    let canViewUnpublished = currentUser.get('performsNonLearnerFunction');
    this.set('canViewUnpublished', canViewUnpublished);
    if (canViewUnpublished || course.get('isPublishedOrScheduled')) {
      return all([
        course.get('sessions'),
        course.get('competencies'),
        course.get('objectives'),
      ]);
    }

    transition.abort();
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canViewUnpublished', this.get('canViewUnpublished'));
  },
});
