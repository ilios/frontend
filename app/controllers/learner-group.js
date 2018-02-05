import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    isEditing: 'edit',
    isBulkAssigning: 'bulkupload',
    sortUsersBy: 'usersBy',
  },
  isEditing: false,
  isBulkAssigning: false,
  sortUsersBy: 'firstName',
});
