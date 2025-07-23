import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { findAll } from '@ember-data/legacy-compat/builders';

export default class ProgramsRoute extends Route {
  @service session;
  @service store;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return (await this.store.request(findAll('school', {
      include: 'programs.programYears.cohort',
      reload: true,
    }))).content;
  }
}
