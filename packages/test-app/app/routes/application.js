import { service } from '@ember/service';
import Route from '@ember/routing/route';
import { loadPolyfills } from 'ilios-common/utils/load-polyfills';
import { formats } from 'ilios-common/app/ember-intl';

export default class ApplicationRoute extends Route {
  @service session;
  @service intl;

  async beforeModel(transition) {
    await this.session.setup();
    this.session.requireAuthentication(transition, 'login');
    await loadPolyfills();
    this.intl.setFormats(formats);
    this.intl.setLocale('en-us');
  }
}
