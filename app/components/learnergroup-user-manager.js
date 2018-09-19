/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  currentUser: service(),
  init(){
    this._super(...arguments);
    this.set('usersBeingMoved', []);
    this.set('selectedUsers', []);
  },
  didRender(){
    this._super(...arguments);
    this.setCheckAllState();
  },
  learnerGroupId: null,
  learnerGroupTitle: null,
  cohortTitle: null,
  users: null,
  selectedUsers: null,
  classNames: ['learnergroup-user-manager'],
  isEditing: false,
  usersBeingMoved: null,
  sortBy: 'firstName',
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.sortBy;
    return sortBy.search(/desc/) === -1;
  }),
  filter: '',
  filteredUsers: computed('filter', 'users.[]', function() {
    let users = this.users?this.users:[];
    const filter = this.filter;

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

  usersInCurrentGroup: computed('filteredUsers.[]', 'learnerGroupId', 'isEditing', function(){
    const isEditing = this.isEditing;
    const filteredUsers = this.filteredUsers;
    if (!isEditing) {
      return filteredUsers;
    }
    const learnerGroupId = this.learnerGroupId;
    return filteredUsers.filter(user => {
      return user.get('lowestGroupInTree').get('id') === learnerGroupId;
    });
  }),

  usersNotInCurrentGroup: computed('filteredUsers.[]', 'learnerGroupId', function(){
    const learnerGroupId = this.learnerGroupId;
    return this.filteredUsers.filter(user => user.get('lowestGroupInTree').get('id') !== learnerGroupId);
  }),

  addSingleUser: task(function * (user) {
    this.usersBeingMoved.pushObject(user);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.addUserToGroup(user);
    this.usersBeingMoved.removeObject(user);
  }),
  removeSingleUser: task(function * (user) {
    this.usersBeingMoved.pushObject(user);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.removeUserFromGroup(user);
    this.usersBeingMoved.removeObject(user);
  }),

  addSelectedUsers: task(function * () {
    const users = this.selectedUsers;
    this.usersBeingMoved.pushObjects(users);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.addUsersToGroup(users);
    this.usersBeingMoved.removeObjects(users);
    this.set('selectedUsers', []);
  }),
  removeSelectedUsers: task(function * () {
    const users = this.selectedUsers;
    this.usersBeingMoved.pushObjects(users);
    //timeout gives the spinner time to render
    yield timeout(10);
    yield this.removeUsersFromGroup(users);
    this.usersBeingMoved.removeObjects(users);
    this.set('selectedUsers', []);
  }),

  setCheckAllState(){
    const selectedUsers = this.selectedUsers.get('length');
    const filteredUsers = this.filteredUsers.get('length');
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
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
    toggleUserSelection(user){
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
        this.selectedUsers.pushObjects(users.mapBy('content'));
      }

      this.setCheckAllState();
    },
  }
});
