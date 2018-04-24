import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { filter } from 'rsvp';
import { inject as service } from '@ember/service';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

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
    let canCreate;
    let schoolsWithUpdateUserPermission;
    if (!enforceRelationshipCapabilityPermissions) {
      const currentUser = this.get('currentUser');
      const user = await currentUser.get('model');
      canCreate = true;
      schoolsWithUpdateUserPermission = await user.get('schools');
    } else {
      const schools = await store.findAll('school');
      const schoolsWithCreateUserPermission = await filter(schools.toArray(), async school => {
        return permissionChecker.canCreateUser(school);
      });
      canCreate = schoolsWithCreateUserPermission.length > 0;
      schoolsWithUpdateUserPermission = await filter(schools.toArray(), async school => {
        return permissionChecker.canUpdateUserInSchool(school);
      });
    }

    return {
      canCreate,
      schoolsWithUpdateUserPermission
    };
  },
});
