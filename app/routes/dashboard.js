import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { hash } from 'rsvp';

export default class DashboardRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;
  @service currentUser;

  async model() {
    return hash({
      schools: this.store.findAll('school'),
      academicYears: this.store.findAll('academic-year'),
    });
  }

  async afterModel() {
    const user = await this.currentUser.getModel();
    const school = await user.school;
    const p1 = this.store.query('session-type', {
      filters: {
        school: school.id,
      },
    });
    const p2 = this.store.query('vocabulary', {
      filters: {
        school: school.id,
      },
    });
    const p3 = this.store.query('term', {
      filters: {
        schools: [school.id],
      },
    });

    return Promise.all([p1, p2, p3]);
  }
}
