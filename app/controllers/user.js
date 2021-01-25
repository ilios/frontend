import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';

export default Controller.extend({
  store: service(),
  permissionChecker: service(),
  currentUser: service(),
  iliosConfig: service(),

  queryParams: [
    'isManagingBio',
    'isManagingRoles',
    'isManagingCohorts',
    'isManagingIcs',
    'isManagingSchools',
  ],
  isManagingBio: false,
  isManagingRoles: false,
  isManagingCohorts: false,
  isManagingIcs: false,
  isManagingSchools: false,

  canCreate: computed('currentUser', async function () {
    const schools = await this.store.findAll('school');
    const schoolsWithCreateUserPermission = await filter(schools.toArray(), async school => {
      return this.permissionChecker.canCreateUser(school);
    });
    return schoolsWithCreateUserPermission.length > 0;
  }),

});
