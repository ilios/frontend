import Ember from 'ember';

export default Ember.Controller.extend({
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
