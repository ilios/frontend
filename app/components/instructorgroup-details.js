import Ember from 'ember';

const { Component, computed } = Ember;
const { filterBy, sort } = computed;

export default Component.extend({
  instructorGroup: null,
  usersSort: ['lastName', 'firstName'],
  usersWithFullName: filterBy('instructorGroup.users', 'fullName'),
  sortedUsers: sort('usersWithFullName', 'usersSort'),
  courseSort: ['title'],
  sortedCourses: sort('instructorGroup.courses', 'courseSort'),
  actions: {
    changeTitle: function(newTitle){
      this.get('instructorGroup').set('title', newTitle);
      this.get('instructorGroup').save();
    },
    addUser: function(user){
      var instructorGroup = this.get('instructorGroup');
      instructorGroup.get('users').addObject(user);
      user.get('instructorGroups').addObject(instructorGroup);
      instructorGroup.save();
    },
    removeUser: function(user){
      var instructorGroup = this.get('instructorGroup');
      instructorGroup.get('users').removeObject(user);
      user.get('instructorGroups').removeObject(instructorGroup);
      instructorGroup.save();
    },
  }
});
