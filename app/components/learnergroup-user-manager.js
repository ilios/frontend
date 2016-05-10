import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('usersBeingMoved', []);
  },
  learnerGroupId: null,
  users: [],
  classNames: ['learnergroup-user-list'],
  isEditing: false,
  usersBeingMoved: [],
  sortBy: 'firstName',
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  filter: '',
  filteredUsers: computed('filter', 'users.[]', function() {
    let users = this.get('users');
    const filter = this.get('filter');

    if (isEmpty(filter)){
      return users;
    }
    const exp = new RegExp(filter, 'gi');

    return users.filter((user) => {
      return user.get('firstName').match(exp) ||
        user.get('lastName').match(exp) ||
        user.get('email').match(exp);
    });
  }),

  addSingleUser: task(function * (user) {
    this.get('usersBeingMoved').pushObject(user);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.get('addUserToGroup')(user);
    this.get('usersBeingMoved').removeObject(user);
  }),
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
