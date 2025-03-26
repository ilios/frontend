import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service intl;
  @service currentUser;
  @service session;

  async beforeModel() {
    await this.session.setup();
    // Set the default locale.
    this.intl.setLocale('en-us');
    window.document.querySelector('html').setAttribute('lang', this.intl.primaryLocale);
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

  async activate() {
    //remove our loading animation once the application is loaded
    document.getElementById('ilios-loading-indicator')?.remove();
  }
}
