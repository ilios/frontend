import Ember from 'ember';

const { observer, run } = Ember;
const { once } = run;

export default Ember.Component.extend({
  classNames: ['learnergroup-overview'],
  learnerGroup: null,
  instructorUsersSort: ['lastName', 'firstName'],
  instructorUsersWithFullName: Ember.computed.filterBy('learnerGroup.instructorUsers', 'fullName'),
  sortedInstructorUsers: Ember.computed.sort('instructorUsersWithFullName', 'instructorUsersSort'),
  courseSort: ['title'],
  sortedCourses: Ember.computed.sort('learnerGroup.courses', 'courseSort'),
  associatedCoursesTitles: Ember.computed.mapBy('sortedCourses', 'title'),
  associatedCoursesString: function(){
    return this.get('associatedCoursesTitles').join(', ');
  }.property('associatedCoursesTitles.@each'),

  multiEditModeOn: false,
  includeAll: false,

  resetCheckBox: observer('multiEditModeOn', function() {
    if (!this.get('multiEditModeOn')) {
      once(this, this.set, 'includeAll', false);
    }
  }),

  actions: {
    addInstructorUser: function(user){
      var learnerGroup = this.get('learnerGroup');
      learnerGroup.get('instructorUsers').addObject(user);
      user.get('instructorUserGroups').addObject(learnerGroup);
      learnerGroup.save();
      user.save();
    },

    removeInstructorUser: function(user){
      var learnerGroup = this.get('learnerGroup');
      learnerGroup.get('instructorUsers').removeObject(user);
      user.get('instructorUserGroups').removeObject(learnerGroup);
      learnerGroup.save();
      user.save();
    },

    changeLocation: function(value){
      this.get('learnerGroup').set('location', value);
      this.get('learnerGroup').save();
    },

    toggleSwitch() {
      this.set('multiEditModeOn', !this.get('multiEditModeOn'));
    }
  }
});
