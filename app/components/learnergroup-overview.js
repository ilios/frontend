import Ember from 'ember';

const { observer, run } = Ember;
const { once } = run;

export default Ember.Component.extend({
  classNames: ['learnergroup-overview'],
  learnerGroup: null,
  instructorsSort: ['lastName', 'firstName'],
  instructorsWithFullName: Ember.computed.filterBy('learnerGroup.instructors', 'fullName'),
  sortedInstructors: Ember.computed.sort('instructorsWithFullName', 'instructorsSort'),
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
    addInstructor: function(user){
      var learnerGroup = this.get('learnerGroup');
      learnerGroup.get('instructors').addObject(user);
      user.get('instructedLearnerGroups').addObject(learnerGroup);
      user.save();
    },

    removeInstructor: function(user){
      var learnerGroup = this.get('learnerGroup');
      learnerGroup.get('instructors').removeObject(user);
      user.get('instructedLearnerGroups').removeObject(learnerGroup);
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
