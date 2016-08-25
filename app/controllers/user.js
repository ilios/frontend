import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'isManagingBio',
    'isManagingRoles',
  ],
  isManagingBio: false,
  isManagingRoles: false,

});
