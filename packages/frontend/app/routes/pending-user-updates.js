import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { filter } from 'rsvp';

import { findAll } from '@ember-data/legacy-compat/builders';

export default class PendingUserUpdatesRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service store;
  @service session;

  queryParams = {
    filter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const {
      content: allSchools
    } = await this.store.request(findAll('school'));
    const schools = await filter(allSchools, async (school) => {
      return this.permissionChecker.canUpdateUserInSchool(school);
    });
    const user = await this.currentUser.getModel();
    const primarySchool = await user.school;
    const {
      content: allPendingUpdates
    } = await this.store.request(findAll('pending-user-update', {
      include: 'user',
    }));
    return { primarySchool, schools, allPendingUpdates };
  }
}
