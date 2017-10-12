import Controller from '@ember/controller';

export default Controller.extend({
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

});
