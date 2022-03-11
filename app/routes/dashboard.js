import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
// eslint-disable-next-line ember/no-mixins
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { hash } from 'rsvp';

export default class DashboardRoute extends Route.extend(AuthenticatedRouteMixin) {
  authenticationRoute = 'login-error';
  @service store;
  @service currentUser;

  async model() {
    return hash({
      schools: this.store.findAll('school'),
      academicYears: this.store.findAll('academic-year'),
    });
  }
}
