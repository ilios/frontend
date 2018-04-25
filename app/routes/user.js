import Route from '@ember/routing/route';
import { hash, all, filter } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  currentUser: service(),
  permissionChecker: service(),
  titleToken: 'general.admin',
  canUpdate: false,
  canCreat: false,
  /**
  * Prefetch user relationship data to smooth loading
  **/
  async afterModel(user){
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const currentUser = this.get('currentUser');
    const obj = await hash({
      cohorts: user.get('cohorts'),
      learnerGroups: user.get('learnerGroups'),
      roles: user.get('roles'),
      schools: user.get('schools'),
    });
    await all([all(obj.cohorts.mapBy('school')), all(obj.learnerGroups.mapBy('school'))]);
    let canUpdate = currentUser.get('userIsDeveloper');
    let canCreate = currentUser.get('userIsDeveloper');
    if (enforceRelationshipCapabilityPermissions) {
      const schools = await store.findAll('school');
      const schoolsWithCreateUserPermission = await filter(schools.toArray(), async school => {
        return permissionChecker.canCreateUser(school);
      });
      canCreate = schoolsWithCreateUserPermission.length > 0;
      canUpdate = permissionChecker.canUpdateUser(user);
    }

    this.set('canUpdate', canUpdate);
    this.set('canCreate', canCreate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
    controller.set('canCreate', this.get('canCreate'));
  },
});
