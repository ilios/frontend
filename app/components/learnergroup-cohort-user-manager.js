import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('usersBeingMoved', []);
    this.set('selectedUsers', []);
  },
  didRender(){
    this._super(...arguments);
    this.setCheckAllState();
  },
  classNames: ['learnergroup-cohort-user-manager'],
  sortBy: 'firstName',
  users: null,
  usersBeingMoved: null,
  selectedUsers: null,
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

    let filteredUsers = users.filter((user) => {
      return user.get('firstName').match(exp) ||
        user.get('lastName').match(exp) ||
        user.get('email').match(exp);
    });

    return filteredUsers;

  }),

  addSingleUser: task(function * (user) {
    this.get('usersBeingMoved').pushObject(user);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.get('addUserToGroup')(user);
    this.get('usersBeingMoved').removeObject(user);
  }),
  addSelectedUsers: task(function * () {
    const users = this.get('selectedUsers');
    this.get('usersBeingMoved').pushObjects(users);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.get('addUsersToGroup')(users);
    this.get('usersBeingMoved').removeObjects(users);
    this.set('selectedUsers', []);
  }),

  setCheckAllState(){
    const selectedUsers = this.get('selectedUsers.length');
    const filteredUsers = this.get('filteredUsers.length');
    let el = this.$('th:eq(0) input');
    if (selectedUsers === 0) {
      el.prop('indeterminate', false);
      el.prop('checked', false);
    } else if (selectedUsers < filteredUsers) {
      el.prop('indeterminate', true);
      el.prop('checked', false);
    } else {
      el.prop('indeterminate', false);
      el.prop('checked', true);
    }
  },
  actions: {
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
    toggleUserSelection(user){
      if (this.get('selectedUsers').includes(user)) {
        this.get('selectedUsers').removeObject(user);
      } else {
        this.get('selectedUsers').pushObject(user);
      }
    },
    toggleUserSelectionAllOrNone() {
      const selectedUsers = this.get('selectedUsers').get('length');
      const filteredUsers = this.get('filteredUsers').get('length');

      if (selectedUsers >= filteredUsers) {
        this.get('selectedUsers').clear();
      } else {
        const users = this.get('filteredUsers');
        this.get('selectedUsers').pushObjects(users);
      }

      this.setCheckAllState();
    },
  }
});
