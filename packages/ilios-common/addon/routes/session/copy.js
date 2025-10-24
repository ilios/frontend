import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionCopyRoute extends Route {
  @service permissionChecker;
  @service session;
  @service currentUser;
  @service router;
  @service dataLoader;
  @service store;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async afterModel(session) {
    const course = await session.course;
    const school = await course.school;
    //preload to improve component performance
    await Promise.all([
      this.dataLoader.loadAcademicYears(),
      this.dataLoader.loadSchoolForCourses(school.id),
    ]);
  }
}
