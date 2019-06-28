import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  currentUser: service(),
  permissionChecker: service(),
  iliosConfig: service(),
  canUpdate: false,

  /**
  * Prefetch user relationship data to smooth loading
  **/
  async afterModel(user){
    const permissionChecker = this.permissionChecker;
    const obj = await hash({
      cohorts: user.get('cohorts'),
      learnerGroups: user.get('learnerGroups'),
      roles: user.get('roles'),
      schools: user.get('schools'),
    });
    await all([all(obj.cohorts.mapBy('school')), all(obj.learnerGroups.mapBy('school'))]);
    const canUpdate = permissionChecker.canUpdateUser(user);

    this.set('canUpdate', canUpdate);

    const userSearchType = await this.iliosConfig.userSearchType;
    if (userSearchType !== 'ldap') {
      await import('zxcvbn');
    }
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.canUpdate);
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('user');
      controller.set('isLoading', true);
      transition.promise.finally(() => {
        controller.set('isLoading', false);
      });

      return true;
    }
  },
});
