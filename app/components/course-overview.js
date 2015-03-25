import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  editable: false,
  course: null,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: Ember.computed.filterBy('course.directors', 'fullName'),
  sortedDirectors: Ember.computed.sort('directorsWithFullName', 'directorsSort'),
  levelOptions: [1,2,3,4,5],
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
    }
  }
});
