import Ember from 'ember';

export default Ember.Component.extend({
  instructorGroup: null,
  usersSort: ['lastName', 'firstName'],
  usersWithFullName: Ember.computed.filterBy('instructorGroup.users', 'fullName'),
  sortedUsers: Ember.computed.sort('usersWithFullName', 'usersSort'),
  courseSort: ['title'],
  sortedCourses: Ember.computed.sort('instructorGroup.courses', 'courseSort'),
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
