import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'isManagingBio',
    'isManagingRoles',
    'isManagingCohorts',
  ],
  isManagingBio: false,
  isManagingRoles: false,
  isManagingCohorts: false,

});
