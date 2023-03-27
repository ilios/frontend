import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseMaterialsRoute extends Route {
  @service session;
  @service dataLoader;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

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
    return all(mapBy(courseLearningMaterials, 'learningMaterial'));
  }

  async loadSessionLearningMaterials(course) {
    const sessions = await course.sessions;
    return all([mapBy(sessions, 'learningMaterials'), mapBy(sessions, 'firstOfferingDate')]);
  }
}
