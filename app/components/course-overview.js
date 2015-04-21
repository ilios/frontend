import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  store: Ember.inject.service(),
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
    this.get('store').find('course-clerkship-type').then(function(clerkshipTypes){
      deferred.resolve(clerkshipTypes.sortBy('title'));
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }.property(),
  actions: {
    addDirector: function(user){
      var course = this.get('course');
      course.get('directors').addObject(user);
      user.get('directedCourses').addObject(course);
      course.save();
      user.save();
    },
    removeDirector: function(user){
      var course = this.get('course');
      course.get('directors').removeObject(user);
      user.get('directedCourses').removeObject(course);
      course.save();
      user.save();
    },
    changeClerkshipType: function(newId){
      var course = this.get('course');
      if(newId){
        this.get('store').find('course-clerkship-type', newId).then(function(type){
          course.set('clerkshipType', type);
          type.get('courses').then(function(courses){
            courses.addObject(course);
            course.save();
            courses.save();
          });
        });
      } else {
        course.get('clerkshipType').then(function(type){
          if(type){
            type.get('courses').then(function(courses){
              courses.removeObject(course);
              course.set('clerkshipType', null);
              courses.save();
              course.save();
            });
          }
        });
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
