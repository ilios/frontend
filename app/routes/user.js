import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class UserRoute extends Route {
  @service store;
  @service currentUser;
  @service permissionChecker;
  @service iliosConfig;
  @service session;

  canUpdate = false;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  /**
   * Prefetch user relationship data to smooth loading
   **/
  async afterModel(user) {
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
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }

  @action
  loading(transition) {
    //@todo refactor away from doing this work in the route [JJ 3/21]
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('user');
    controller.set('isLoading', true);
    transition.promise.finally(() => {
      controller.set('isLoading', false);
    });

    return true;
  }
}
