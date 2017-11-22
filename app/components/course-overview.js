import { inject as service } from '@ember/service';
import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { not, reads } = computed;
const { Promise, all } = RSVP;

const Validations = buildValidations({
  externalId: [
    validator('length', {
      allowBlank: true,
      min: 2,
      max: 255
    }),
  ],
  startDate: [
    validator('date', {
      dependentKeys: ['model.endDate'],
      onOrBefore: reads('model.endDate'),
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['model.startDate'],
      onOrAfter: reads('model.startDate'),
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),
  currentUser: service(),
  routing: service('-routing'),
  editable: not('course.locked'),
  universalLocator: 'ILIOS',
  init(){
    this._super(...arguments);
    this.get('store').findAll('course-clerkship-type').then(clerkshipTypes => {
      this.set('clerkshipTypeOptions', clerkshipTypes.sortBy('title'));
    });

    let levelOptions = [];
    for(let i=1;i<=5; i++){
      levelOptions.pushObject(EmberObject.create({
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
    this.set('startDate', course.get('startDate'));
    this.set('endDate', course.get('endDate'));
    this.set('level', course.get('level'));

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
  startDate: null,
  level: null,
  levelOptions: null,
  classNames: ['course-overview'],
  tagName: 'section',
  clerkshipTypeId: null,
  clerkshipTypeOptions: null,
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
          resolve(hasRole.includes(true));
        });
      }

    });
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
    changeStartDate(){
      const newDate = this.get('startDate');
      const course = this.get('course');
      this.send('addErrorDisplayFor', 'startDate');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'startDate');
            course.set('startDate', newDate);
            course.save().then((newCourse) => {
              this.set('startDate', newCourse.get('startDate'));
              this.set('course', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertStartDateChanges(){
      const course = this.get('course');
      this.set('startDate', course.get('startDate'));
    },
    changeEndDate(){
      const newDate = this.get('endDate');
      const course = this.get('course');
      this.send('addErrorDisplayFor', 'endDate');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'endDate');
            course.set('endDate', newDate);
            course.save().then((newCourse) => {
              this.set('endDate', newCourse.get('endDate'));
              this.set('course', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertEndDateChanges(){
      const course = this.get('course');
      this.set('endDate', course.get('endDate'));
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

    changeLevel(){
      this.get('course').set('level', this.get('level'));
      this.get('course').save();
    },

    revertLevelChanges(){
      this.set('level', this.get('course').get('level'));
    },
  }
});
