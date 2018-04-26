import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { filter } from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  permissionChecker: service(),
  currentUser: service(),
  titleToken: 'general.admin',

  beforeModel() {
    const currentUser = this.get('currentUser');
    const performsNonLearnerFunction = currentUser.get('performsNonLearnerFunction');
    if (!performsNonLearnerFunction) {
      this.transitionTo('dashboard');
    }
  },

  async model() {
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const schools = await store.findAll('school');
    const schoolsWithCreateUserPermission = await filter(schools.toArray(), async school => {
      return permissionChecker.canCreateUser(school);
    });
    const canCreate = schoolsWithCreateUserPermission.length > 0;
    const schoolsWithUpdateUserPermission = await filter(schools.toArray(), async school => {
      return permissionChecker.canUpdateUserInSchool(school);
    });

    return {
      canCreate,
      schoolsWithUpdateUserPermission
    };
  },
});
