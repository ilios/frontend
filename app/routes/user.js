import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class UserRoute extends Route {
  @service store;
  @service currentUser;
  @service iliosConfig;
  @service session;
  @service dataLoader;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.dataLoader.loadUserProfile(params.user_id);
  }

  /**
   * Prefetch user relationship data to smooth loading
   **/
  async afterModel(user) {
    await this.dataLoader.loadUserProfile(user.id);

    const userSearchType = await this.iliosConfig.getUserSearchType();
    if (userSearchType !== 'ldap') {
      await import('zxcvbn');
    }
  }
}
