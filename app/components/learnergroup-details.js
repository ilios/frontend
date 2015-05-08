import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  learnerGroup: null,
  notInThisGroupTranslation: 'learnerGroups.notInThisGroup',
  topLevelGroupMembersNotInThisGroup: function(){
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
  }.property('learnerGroup.topLevelGroup.allDescendantUsers.@each', 'learnerGroup.user.@each'),
  cohortMembersNotInAnyGroup: function(){
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
  }.property('learnerGroup.topLevelGroup.allDescendantUsers.@each', 'learnerGroup.user.@each', 'learnerGroup.cohort.users.@each'),
});
