import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),
  dataLoader: service(),

  queryParams: {
    titleFilter: {
      replace: true
    }
  },

  async model() {
    const user = await this.currentUser.getModel();
    return hash({
      schools: this.store.peekAll('school'),
      primarySchool: this.dataLoader.loadSchoolForCourses(user.belongsTo('school').id()),
      years: this.store.findAll('academic-year'),
    });
  },

  actions: {
    willTransition() {
      this.controller.set('newCourse', null);
    }
  }
});
