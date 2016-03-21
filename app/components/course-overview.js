import Ember from 'ember';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, RSVP } = Ember;
const { not } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  externalId: [
    validator('length', {
      min: 2,
      max: 18
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: Ember.inject.service(),
  editable: not('course.locked'),
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('externalId', this.get('course.externalId'));
  },
  course: null,
  externalId: null,
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
    changeExternalId() {
      const newExternalId = this.get('externalId');
      const course = this.get('course');
      this.send('addErrorDisplayFor', 'externalId');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'externalId');
            course.set('externalId', newExternalId);
            course.save().then((newCourse) => {
              this.set('externalId', newCourse.get('externalId'));
              this.set('course', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertExternalIdChanges(){
      const course = this.get('course');
      this.set('externalId', course.get('externalId'));
    },

    changeLevel: function(value){
      this.get('course').set('level', value);
      this.get('course').save();
    },
  }
});
