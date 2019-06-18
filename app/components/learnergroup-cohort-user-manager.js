import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  currentUser: service(),

  classNames: ['learnergroup-cohort-user-manager'],

  canUpdate: false,
  filter: '',
  selectedUsers: null,
  sortBy: 'firstName',
  users: null,
  usersBeingMoved: null,

  sortedAscending: computed('sortBy', function() {
    return this.sortBy.search(/desc/) === -1;
  }),

  filteredUsers: computed('filter', 'users.[]', function() {
    let users = this.users;
    const filter = this.filter.toLowerCase();

    if (isEmpty(filter)){
      return users;
    }

    return users.filter((user) => {
      return user.get('firstName').toLowerCase().includes(filter) ||
        user.get('lastName').toLowerCase().includes(filter) ||
        user.get('email').toLowerCase().includes(filter);
    });
  }),

  init() {
    this._super(...arguments);
    this.setProperties({ selectedUsers: [], usersBeingMoved: [] });
  },

  didRender() {
    this._super(...arguments);
    this.setCheckAllState();
  },

  actions: {
    sortBy(what) {
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },

    toggleUserSelection(user) {
      if (this.selectedUsers.includes(user)) {
        this.selectedUsers.removeObject(user);
      } else {
        this.selectedUsers.pushObject(user);
      }
    },

    toggleUserSelectionAllOrNone() {
      const selectedUsers = this.selectedUsers.get('length');
      const filteredUsers = this.filteredUsers.get('length');

      if (selectedUsers >= filteredUsers) {
        this.selectedUsers.clear();
      } else {
        const users = this.filteredUsers;
        this.selectedUsers.pushObjects(users);
      }

      this.setCheckAllState();
    }
  },

  setCheckAllState() {
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

  addSingleUser: task(function* (user) {
    this.usersBeingMoved.pushObject(user);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.addUserToGroup(user);
    this.usersBeingMoved.removeObject(user);
  }),

  addSelectedUsers: task(function* () {
    const users = this.selectedUsers;
    this.usersBeingMoved.pushObjects(users);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.addUsersToGroup(users);
    this.usersBeingMoved.removeObjects(users);
    this.set('selectedUsers', []);
  })
});
