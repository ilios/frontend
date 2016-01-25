import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { Component, computed } = Ember;

export default Component.extend({
  i18n: Ember.inject.service(),
  learnerGroup: null,
  notInThisGroup: t('learnerGroups.notInThisGroup'),
  topLevelGroupMembersNotInThisGroup: computed(
    'learnerGroup.topLevelGroup.allDescendantUsers.[]',
    'learnerGroup.users.[]',
    function(){
      var deferred = Ember.RSVP.defer();
      this.get('learnerGroup.usersOnlyAtThisLevel').then(currentUsers => {
        this.get('learnerGroup.topLevelGroup').then(topLevelGroup => {
          topLevelGroup.get('allDescendantUsers').then(users => {
            let filteredUsers = users.filter(
              user => !currentUsers.contains(user)
            );
            deferred.resolve(filteredUsers.sortBy('fullName'));
          });
        });
      });

      return DS.PromiseArray.create({
        promise: deferred.promise
      });
    }
  ),
  cohortMembersNotInAnyGroup: computed(
    'learnerGroup.topLevelGroup.allDescendantUsers.[]',
    'learnerGroup.users.[]',
    'learnerGroup.cohort.users.[]',
    function(){
      var deferred = Ember.RSVP.defer();
      this.get('learnerGroup.topLevelGroup').then(topLevelGroup => {
        topLevelGroup.get('allDescendantUsers').then(currentUsers => {
          this.get('learnerGroup.cohort').then(cohort => {
            cohort.get('users').then(users => {
              let filteredUsers = users.filter(
                user => !currentUsers.contains(user)
              );
              deferred.resolve(filteredUsers.sortBy('fullName'));
            });
          });
        });
      });
      return DS.PromiseArray.create({
        promise: deferred.promise
      });
    }
  )
});
