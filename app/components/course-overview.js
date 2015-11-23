import Ember from 'ember';
import DS from 'ember-data';

const { Component, inject } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  flashMessages: service(),

  editable: true,
  course: null,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: Ember.computed.filterBy('course.directors', 'fullName'),
  sortedDirectors: Ember.computed.sort('directorsWithFullName', 'directorsSort'),
  levelOptions: function(){
    var arr = [];
    for(let i=1;i<=5; i++){
      arr.pushObject(Ember.Object.create({
        id: i,
        title: i
      }));
    }

    return arr;
  }.property(),
  classNames: ['course-overview'],
  clerkshipTypeOptions: function(){
    var deferred = Ember.RSVP.defer();
    this.get('store').findAll('course-clerkship-type').then(function(clerkshipTypes){
      deferred.resolve(clerkshipTypes.sortBy('title'));
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property(),

  externalIdValidations: {
    'validationBuffer': {
      length: { minimum: 2, maximum: 50 }
    }
  },

  startDateFlag: false,
  endDateFlag: false,

  checkDate(whichDate) {
    const startDate = this.get('course.startDate');
    const endDate = this.get('course.endDate');

    if (endDate <= startDate) {
      this.get('flashMessages').warning('courses.courseDateMessage');

      if (whichDate === 'start') {
        this.set('startDateFlag', true);
      } else {
        this.set('endDateFlag', true);
      }
    } else {
      this.setProperties({ startDateFlag: false, endDateFlag: false });
    }
  },

  actions: {
    addDirector: function(user){
      var course = this.get('course');
      course.get('directors').addObject(user);
      user.get('directedCourses').addObject(course);
      course.save();
    },
    removeDirector: function(user){
      var course = this.get('course');
      course.get('directors').removeObject(user);
      user.get('directedCourses').removeObject(course);
      course.save();

    },
    changeClerkshipType: function(newId){
      var course = this.get('course');
      if(newId){
        this.get('store').find('course-clerkship-type', newId).then(function(type){
          course.set('clerkshipType', type);
          course.save();
        });
      } else {
        course.set('clerkshipType', null);
        course.save();
      }
    },

    changeStartDate: function(newDate){
      this.get('course').set('startDate', newDate);
      this.get('course').save();
      this.checkDate('end');
    },

    changeEndDate: function(newDate){
      this.get('course').set('endDate', newDate);
      this.get('course').save();
      this.checkDate('start');
    },

    changeExternalId: function(value){
      this.get('course').set('externalId', value);
      this.get('course').save();
    },
    changeLevel: function(value){
      this.get('course').set('level', value);
      this.get('course').save();
    },
  }
});
