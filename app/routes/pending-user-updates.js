import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';

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
    const allSchools = await this.store.findAll('school');
    const schools = await filter(allSchools.toArray(), async (school) => {
      return this.permissionChecker.canUpdateUserInSchool(school);
    });
    const user = await this.currentUser.getModel();
    const primarySchool = await user.school;
    const allPendingUpdates = await this.store.findAll('pending-user-update', {
      include: 'user',
    });
    return { primarySchool, schools, allPendingUpdates };
  }
}
