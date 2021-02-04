import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default class CourseMaterialsRoute extends Route {
  @service session;

  titleToken = 'general.coursesAndSessions';

  afterModel(course) {
    return all([
      this.loadCourseLearningMaterials(course),
      this.loadSessionLearningMaterials(course),
    ]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
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
