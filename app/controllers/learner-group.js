import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    isEditing: 'edit',
    sortUsersBy: 'usersBy',
  },
  isEditing: false,
  sortUsersBy: 'firstName',
});
