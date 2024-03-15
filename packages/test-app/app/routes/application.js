import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { loadPolyfills } from 'ilios-common/utils/load-polyfills';

export default class ApplicationRoute extends Route {
  @service session;
  @service intl;

  async beforeModel(transition) {
    await this.session.setup();
    this.session.requireAuthentication(transition, 'login');
    await loadPolyfills();
    this.intl.setLocale('en-us');
  }
}
