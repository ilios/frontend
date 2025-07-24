import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class CoursesRoute extends Route {
  @service currentUser;
  @service store;
  @service dataLoader;
  @service session;
  @service router;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      // Slash on the route name is necessary here due to this bug:
      // https://github.com/emberjs/ember.js/issues/12945
      this.router.replaceWith('/four-oh-four');
    }
  }

  async model() {
    const user = await this.currentUser.getModel();
    return hash({
      schools: this.store.findAll('school'),
      primarySchool: this.dataLoader.loadSchoolForCourses(user.belongsTo('school').id()),
      years: this.store.findAll('academic-year'),
    });
  }
}
