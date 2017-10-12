import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    offset: 'offset',
    limit: 'limit',
    query: 'filter',
    showNewUserForm: 'addUser',
    showBulkNewUserForm: 'addUsers',
    searchTerms: 'search',
  },
  offset: 0,
  limit: 25,
  query: null,
  showNewUserForm: false,
  showBulkNewUserForm: false,
  searchTerms: null,

  actions: {
    transitionToUser(userId){
      this.transitionToRoute('user', userId);
    },
  }
});
