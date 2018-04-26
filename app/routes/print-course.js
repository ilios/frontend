import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all }  from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  titleToken: 'general.coursesAndSessions',
  canViewUnpublished: false,
  // only allow privileged users to view unpublished courses
  async afterModel(course, transition) {
    const currentUser = this.get('currentUser');
    let canViewUnpublished;
    if (!enforceRelationshipCapabilityPermissions) {
      const hasRole = await all([
        currentUser.get('userIsCourseDirector'),
        currentUser.get('userIsFaculty'),
        currentUser.get('userIsDeveloper'),
      ]);
      canViewUnpublished = hasRole.includes(true);
    } else {
      canViewUnpublished = currentUser.get('performsNonLearnerFunction');
    }
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
