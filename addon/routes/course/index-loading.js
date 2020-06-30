import Route from '@ember/routing/route';

export default class CourseIndexLoadingRoute extends Route {
  setupController(controller, model) {
    super.setupController(controller, model);
    const course = this.modelFor('course');
    controller.set('sessionsCount', course.hasMany('sessions').ids().length);
  }
}
