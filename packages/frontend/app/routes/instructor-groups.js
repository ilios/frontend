import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { findAll } from '@ember-data/legacy-compat/builders';

export default class InstructorGroupsRoute extends Route {
  @service store;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return (await this.store.request(findAll('school'))).content;
  }
}
