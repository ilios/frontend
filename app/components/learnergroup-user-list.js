import Ember from 'ember';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  classNames: ['learnergroup-user-list'],
  users: [],
  sortBy: 'firstName',
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  filter: '',
  filteredUsers: computed('filter', 'users.[]', {
    get() {
      const filter = this.get('filter');
      const users = this.get('users');

      if (isEmpty(filter)){
        return users;
      }
      const exp = new RegExp(filter, 'gi');

      return users.filter((user) => {
        return user.get('firstName').match(exp) ||
          user.get('lastName').match(exp) ||
          user.get('email').match(exp);
      });
    }
  }).readOnly(),
  actions: {
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    }
  }
});
