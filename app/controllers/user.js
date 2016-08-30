import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'isManagingBio',
    'isManagingRoles',
    'isManagingCohorts',
    'isManagingIcs',
  ],
  isManagingBio: false,
  isManagingRoles: false,
  isManagingCohorts: false,
  isManagingIcs: false,

});
