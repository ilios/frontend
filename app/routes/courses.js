import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class CoursesRoute extends Route {
  @service currentUser;
  @service store;
  @service dataLoader;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true
    }
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const user = await this.currentUser.getModel();
    return hash({
      schools: this.store.peekAll('school'),
      primarySchool: this.dataLoader.loadSchoolForCourses(user.belongsTo('school').id()),
      years: this.store.findAll('academic-year'),
    });
  }

  @action
  willTransition() {
    this.controller.set('newCourse', null);
  }
}
