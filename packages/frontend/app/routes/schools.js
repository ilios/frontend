import { service } from '@ember/service';
import Route from '@ember/routing/route';

import { query } from '@ember-data/json-api/request';

export default class SchoolsRoute extends Route {
  @service store;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return (await this.store.request(query('school'))).content.data;
  }
}
