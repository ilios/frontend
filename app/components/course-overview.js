import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed } = Ember;

export default Component.extend({
  store: Ember.inject.service(),
  editable: true,
  course: null,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: computed.filterBy('course.directors', 'fullName'),
  sortedDirectors: computed.sort('directorsWithFullName', 'directorsSort'),
  levelOptions: computed(function(){
    var arr = [];
    for(let i=1;i<=5; i++){
      arr.pushObject(Ember.Object.create({
        id: i,
        title: i
      }));
    }

    return arr;
  }),
  classNames: ['course-overview'],
  clerkshipTypeOptions: computed(function(){
    var deferred = Ember.RSVP.defer();
    this.get('store').findAll('course-clerkship-type').then(function(clerkshipTypes){
      deferred.resolve(clerkshipTypes.sortBy('title'));
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),

  externalIdValidations: {
    'validationBuffer': {
      length: { minimum: 2, maximum: 50 }
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
    },
    changeEndDate: function(newDate){
      this.get('course').set('endDate', newDate);
      this.get('course').save();
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
