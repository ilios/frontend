import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  instructorGroup: null,
  classNames: ['instructorgroup-details'],
  actions: {
    addUser: function(user){
      let instructorGroup = this.get('instructorGroup');
      instructorGroup.get('users').addObject(user);
      user.get('instructorGroups').addObject(instructorGroup);
      instructorGroup.save();
    },
    removeUser: function(user){
      let instructorGroup = this.get('instructorGroup');
      instructorGroup.get('users').removeObject(user);
      user.get('instructorGroups').removeObject(instructorGroup);
      instructorGroup.save();
    },
  }
});
