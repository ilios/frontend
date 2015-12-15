import Ember from 'ember';
import config from '../config/environment';

const { Component, computed, observer, run } = Ember;
const { filterBy, mapBy, sort } = computed;
const { once } = run;
const { IliosFeatures: { learnerGroupMultiedit } } = config;

export default Component.extend({
  classNames: ['learnergroup-overview'],
  learnerGroup: null,
  instructorsSort: ['lastName', 'firstName'],
  instructorsWithFullName: filterBy('learnerGroup.instructors', 'fullName'),
  sortedInstructors: sort('instructorsWithFullName', 'instructorsSort'),
  courseSort: ['title'],
  sortedCourses: sort('learnerGroup.courses', 'courseSort'),
  associatedCoursesTitles: mapBy('sortedCourses', 'title'),
  associatedCoursesString: computed('associatedCoursesTitles.[]', function(){
    return this.get('associatedCoursesTitles').join(', ');
  }),

  multiEditModeOn: false,
  includeAll: false,

  resetCheckBox: observer('multiEditModeOn', function() {
    if (!this.get('multiEditModeOn')) {
      once(this, this.set, 'includeAll', false);
    }
  }),

  isActive: learnerGroupMultiedit,

  actions: {
    addInstructor: function(user){
      var learnerGroup = this.get('learnerGroup');
      learnerGroup.get('instructors').addObject(user);
      user.get('instructedLearnerGroups').addObject(learnerGroup);
      learnerGroup.save();
    },

    removeInstructor: function(user){
      var learnerGroup = this.get('learnerGroup');
      learnerGroup.get('instructors').removeObject(user);
      user.get('instructedLearnerGroups').removeObject(learnerGroup);
      learnerGroup.save();
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
