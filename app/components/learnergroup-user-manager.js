import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('usersBeingMoved', []);
    this.set('selectedUsers', []);
  },
  learnerGroupId: null,
  learnerGroupTitle: null,
  cohortTitle: null,
  users: [],
  selectedUsers: [],
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
  removeSingleUser: task(function * (user) {
    this.get('usersBeingMoved').pushObject(user);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.get('removeUserFromGroup')(user);
    this.get('usersBeingMoved').removeObject(user);
  }),

  addSelectedUsers: task(function * () {
    const users = this.get('selectedUsers');
    this.get('usersBeingMoved').pushObjects(users);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.get('addUsersToGroup')(users);
    this.get('usersBeingMoved').removeObjects(users);
  }),
  removeSelectedUsers: task(function * () {
    const users = this.get('selectedUsers');
    this.get('usersBeingMoved').pushObjects(users);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.get('removeUsersFromGroup')(users);
    this.get('usersBeingMoved').removeObjects(users);
  }),
  actions: {
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
    toggleUserSelection(user){
      if (this.get('selectedUsers').contains(user)) {
        this.get('selectedUsers').removeObject(user);
      } else {
        this.get('selectedUsers').pushObject(user);
      }
    }
  }
});
