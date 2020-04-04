import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all } from 'rsvp';

export default class CourseMaterialsRoute extends Route.extend(AuthenticatedRouteMixin) {
  titleToken = 'general.coursesAndSessions';

  afterModel(course) {
    return all([
      this.loadCourseLearningMaterials(course),
      this.loadSessionLearningMaterials(course),
    ]);

  }

  async loadCourseLearningMaterials(course) {
    const courseLearningMaterials = await course.learningMaterials;
    return all(courseLearningMaterials.mapBy('learningMaterial'));
  }

  async loadSessionLearningMaterials(course) {
    const sessions = await course.sessions;
    return all([sessions.mapBy('learningMaterials'), sessions.mapBy('firstOfferingDate')]);
  }
}
