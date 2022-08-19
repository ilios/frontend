import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class ApplicationRoute extends Route {
  @service intl;
  @service moment;
  @service currentUser;
  @service session;

  async beforeModel() {
    await this.session.setup();
    const intl = this.intl;
    const moment = this.moment;
    moment.setLocale(intl.locale[0]);
    window.document.querySelector('html').setAttribute('lang', intl.locale);
  }

  /**
   * Preload the user model and the users roles
   * This makes the initial page rendering (especially the navigation) much smoother
   */
  async afterModel() {
    const currentUser = this.currentUser;
    const user = await currentUser.getModel();
    if (user) {
      await user.roles;
    }
  }
}
