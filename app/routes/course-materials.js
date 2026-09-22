import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseMaterialsRoute extends Route {
  @service dataLoader;
  @service currentUser;
  @service router;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  afterModel(course) {
    return Promise.all([
      this.loadCourseLearningMaterials(course),
      this.loadSessionLearningMaterials(course),
    ]);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async loadCourseLearningMaterials(course) {
    const courseLearningMaterials = await course.learningMaterials;
    return Promise.all(mapBy(courseLearningMaterials, 'learningMaterial'));
  }

  async loadSessionLearningMaterials(course) {
    const sessions = await course.sessions;
    return Promise.all([
      mapBy(sessions, 'learningMaterials'),
      mapBy(sessions, 'firstOfferingDate'),
    ]);
  }
}
