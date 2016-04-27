import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: {
    isEditing: 'edit',
    sortUsersBy: 'usersBy',
  },
  isEditing: false,
  sortUsersBy: 'firstName',
});
