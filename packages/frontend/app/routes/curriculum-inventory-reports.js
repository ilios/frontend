import { service } from '@ember/service';
import Route from '@ember/routing/route';

import { findAll } from '@ember-data/legacy-compat/builders';

export default class CurriculumInventoryReportsRoute extends Route {
  @service currentUser;
  @service store;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return (await this.store.request(findAll('school'))).content;
  }
}
