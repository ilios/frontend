import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsRoute extends Route {
  @service session;
  @service currentUser;
  @service dataLoader;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel() {
    const user = await this.currentUser.getModel();
    return this.dataLoader.loadSchoolForCourses(user.belongsTo('school').id());
  }
}
