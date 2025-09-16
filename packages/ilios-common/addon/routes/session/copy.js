import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionCopyRoute extends Route {
  @service permissionChecker;
  @service session;
  @service currentUser;
  @service router;
  @service dataLoader;
  @service store;

  canUpdate = false;

  async afterModel(session) {
    const course = await session.course;
    const school = await course.school;
    //preload to improve component performance
    const [canUpdate] = await Promise.all([
      this.permissionChecker.canUpdateSession(session),
      this.dataLoader.loadAcademicYears(),
      this.dataLoader.loadSchoolForCourses(school.id),
    ]);

    this.canUpdate = canUpdate;
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
