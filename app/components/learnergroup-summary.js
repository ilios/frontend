import Ember from 'ember';

const { Component, RSVP, computed } = Ember;
const { Promise } = RSVP;

export default Component.extend({
  learnerGroup: null,
  classNames: ['detail-view', 'learnergroup-detail-view'],
  tagName: 'section',
  cohortMembersNotInAnyGroup: computed(
    'learnerGroup.topLevelGroup.allDescendantUsers.[]',
    'learnerGroup.users.[]',
    'learnerGroup.cohort.users.[]',
    function(){
      return new Promise(resolve => {
        this.get('learnerGroup.topLevelGroup').then(topLevelGroup => {
          topLevelGroup.get('allDescendantUsers').then(currentUsers => {
            this.get('learnerGroup.cohort').then(cohort => {
              cohort.get('users').then(users => {
                let filteredUsers = users.filter(
                  user => !currentUsers.contains(user)
                );
                resolve(filteredUsers.sortBy('fullName'));
              });
            });
          });
        });
      });

    }
  ),
});
