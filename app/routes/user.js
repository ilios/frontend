import Route from '@ember/routing/route';
import { hash, all, filter } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  currentUser: service(),
  permissionChecker: service(),
  titleToken: 'general.admin',
  canUpdate: false,
  canCreate: false,
  /**
  * Prefetch user relationship data to smooth loading
  **/
  async afterModel(user){
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const obj = await hash({
      cohorts: user.get('cohorts'),
      learnerGroups: user.get('learnerGroups'),
      roles: user.get('roles'),
      schools: user.get('schools'),
    });
    await all([all(obj.cohorts.mapBy('school')), all(obj.learnerGroups.mapBy('school'))]);
    const schools = await store.findAll('school');
    const schoolsWithCreateUserPermission = await filter(schools.toArray(), async school => {
      return permissionChecker.canCreateUser(school);
    });
    const canCreate = schoolsWithCreateUserPermission.length > 0;
    const canUpdate = permissionChecker.canUpdateUser(user);

    this.set('canUpdate', canUpdate);
    this.set('canCreate', canCreate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
    controller.set('canCreate', this.get('canCreate'));
  },
});
