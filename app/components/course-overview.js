import Ember from 'ember';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, RSVP, isEmpty, inject } = Ember;
const { not } = computed;
const { Promise, all } = RSVP;
const { service } = inject;

const Validations = buildValidations({
  externalId: [
    validator('length', {
      allowBlank: true,
      min: 2,
      max: 18
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  currentUser: service(),
  routing: service('-routing'),
  editable: not('course.locked'),
  init(){
    this._super(...arguments);
    this.get('store').findAll('course-clerkship-type').then(clerkshipTypes => {
      this.set('clerkshipTypeOptions', clerkshipTypes.sortBy('title'));
    });

    let levelOptions = [];
    for(let i=1;i<=5; i++){
      levelOptions.pushObject(Ember.Object.create({
        id: i,
        title: i
      }));
    }
    this.set('levelOptions', levelOptions);
  },
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('directorsToPassToManager').perform();
    const course = this.get('course');
    this.set('externalId', course.get('externalId'));

    course.get('clerkshipType').then(clerkshipType => {
      if (isEmpty(clerkshipType)) {
        this.set('clerkshipTypeId', null);
      } else {
        this.set('clerkshipTypeId', clerkshipType.get('id'));
      }
    });
  },
  course: null,
  externalId: null,
  levelOptions: [],
  classNames: ['course-overview'],
  tagName: 'section',
  clerkshipTypeId: null,
  clerkshipTypeOptions: [],
  manageDirectors: false,
  showDirectorManagerLoader: true,
  currentRoute: '',
  selectedClerkshipType: computed('clerkshipTypeId', 'clerkshipTypeOptions.[]', function() {
    const id = this.get('clerkshipTypeId');
    if (isEmpty(id)) {
      return null;
    }

    return this.get('clerkshipTypeOptions').findBy('id', id);
  }),
  directorsToPassToManager: task(function * () {
    const course = this.get('course');

    let users = yield course.get('directors');

    this.set('showDirectorManagerLoader', false);
    return users;
  }).restartable(),

  showRollover: computed('currentUser', 'routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.get('routing');
      if (routing.get('currentRouteName') === 'course.rollover') {
        resolve(false);
      } else {
        const currentUser = this.get('currentUser');
        all([
          currentUser.get('userIsCourseDirector'),
          currentUser.get('userIsDeveloper')
        ]).then(hasRole => {
          resolve(hasRole.contains(true));
        });
      }

    })
  }),

  actions: {
    saveDirectors(newDirectors){
      const course = this.get('course');
      course.set('directors', newDirectors.toArray());
      return course.save().then(()=>{
        this.get('directorsToPassToManager').perform();
        return this.set('manageDirectors', false);
      });
    },
    changeClerkshipType(){
      const course = this.get('course');
      const selectedClerkshipType = this.get('selectedClerkshipType');
      course.set('clerkshipType', selectedClerkshipType);
      return course.save();
    },

    setCourseClerkshipType(id){
      //convert the string 'null' to a real null
      if (id === 'null') {
        id = null;
      }
      this.set('clerkshipTypeId', id);
    },

    revertClerkshipTypeChanges(){
      const course = this.get('course');
      course.get('clerkshipType').then(clerkshipType => {
        if (isEmpty(clerkshipType)) {
          this.set('clerkshipTypeId', null);
        } else {
          this.set('clerkshipTypeId', clerkshipType.get('id'));
        }
      });
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
