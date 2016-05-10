import Ember from 'ember';

const { Component, computed, isEmpty, RSVP } = Ember;
const { Promise, all } = RSVP;

export default Component.extend({
  classNames: ['learnergroup-user-list'],
  learnerGroup: null,
  sortBy: 'firstName',
  usersBeingMoved: [],
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  filter: '',
  filteredUsers: computed('filter', 'users.[]', function() {
    return new Promise(resolve => {
      this.get('users').then(users => {
        const filter = this.get('filter');

        if (isEmpty(filter)){
          resolve(users);
        } else {
          const exp = new RegExp(filter, 'gi');

          let filteredUsers = users.filter((user) => {
            return user.get('firstName').match(exp) ||
              user.get('lastName').match(exp) ||
              user.get('email').match(exp);
          });

          resolve(filteredUsers);
        }

      });
    });
  }),

  users: computed(
    'learnerGroup.topLevelGroup.allDescendantUsers.[]',
    'learnerGroup.users.[]',
    'learnerGroup.cohort.users.[]',
    function(){
      const learnerGroup = this.get('learnerGroup');
      return new Promise(resolve => {
        learnerGroup.get('topLevelGroup').then(topLevelGroup => {
          topLevelGroup.get('allDescendantUsers').then(currentUsers => {
            this.get('learnerGroup.cohort').then(cohort => {
              cohort.get('users').then(users => {
                let filteredUsers = users.filter(
                  user => !currentUsers.contains(user)
                );
                resolve(filteredUsers);
              });
            });
          });
        });
      });

    }
  ),
  actions: {
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
