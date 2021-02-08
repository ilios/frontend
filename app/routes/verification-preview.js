import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class VerificationPreviewRoute extends Route {
  @service session;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
