import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';
import { inject as service } from '@ember/service';

export default class UserRoute extends Route {
  @service store;
  @service currentUser;
  @service iliosConfig;
  @service session;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  /**
   * Prefetch user relationship data to smooth loading
   **/
  async afterModel(user) {
    const obj = await hash({
      cohorts: user.get('cohorts'),
      learnerGroups: user.get('learnerGroups'),
      roles: user.get('roles'),
      schools: user.get('schools'),
    });
    await all([all(obj.cohorts.mapBy('school')), all(obj.learnerGroups.mapBy('school'))]);

    const userSearchType = await this.iliosConfig.getUserSearchType();
    if (userSearchType !== 'ldap') {
      await import('zxcvbn');
    }
  }
}
