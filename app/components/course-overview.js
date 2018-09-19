/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { reads } = computed;
const { Promise } = RSVP;

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
  permissionChecker: service(),
  i18n: service(),
  editable: false,
  universalLocator: 'ILIOS',
  'data-test-course-overview': true,
  init(){
    this._super(...arguments);

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
    this.directorsToPassToManager.perform();
    const course = this.course;
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
  manageDirectors: false,
  showDirectorManagerLoader: true,
  currentRoute: '',
  selectedClerkshipType: computed('clerkshipTypeId', 'clerkshipTypeOptions.[]', async function() {
    const id = this.clerkshipTypeId;
    const clerkshipTypeOptions = await this.clerkshipTypeOptions;
    if (isEmpty(id)) {
      return null;
    }

    return clerkshipTypeOptions.findBy('id', id);
  }),
  directorsToPassToManager: task(function * () {
    const course = this.course;

    let users = yield course.get('directors');

    this.set('showDirectorManagerLoader', false);
    return users;
  }).restartable(),

  showRollover: computed('course', 'routing.currentRouteName', async function () {
    const routing = this.routing;
    if (routing.get('currentRouteName') === 'course.rollover') {
      return false;
    }

    const permissionChecker = this.permissionChecker;
    const course = this.course;
    const school = await course.get('school');
    return permissionChecker.canCreateCourse(school);
  }),

  clerkshipTypeTitle: computed('selectedClerkshipType', async function () {
    const selectedClerkshipType = await this.selectedClerkshipType;
    const i18n = this.i18n;
    if (!selectedClerkshipType) {
      return i18n.t('general.notAClerkship');
    }

    return selectedClerkshipType.title;
  }),

  clerkshipTypeOptions: computed(async function () {
    const store = this.store;
    return store.findAll('course-clerkship-type');
  }),

  actions: {
    saveDirectors(newDirectors){
      const course = this.course;
      course.set('directors', newDirectors.toArray());
      return course.save().then(()=>{
        this.directorsToPassToManager.perform();
        return this.set('manageDirectors', false);
      });
    },
    async changeClerkshipType(){
      const course = this.course;
      const selectedClerkshipType = await this.selectedClerkshipType;
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
      const course = this.course;
      course.get('clerkshipType').then(clerkshipType => {
        if (isEmpty(clerkshipType)) {
          this.set('clerkshipTypeId', null);
        } else {
          this.set('clerkshipTypeId', clerkshipType.get('id'));
        }
      });
    },
    changeStartDate(){
      const newDate = this.startDate;
      const course = this.course;
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
      const course = this.course;
      this.set('startDate', course.get('startDate'));
    },
    changeEndDate(){
      const newDate = this.endDate;
      const course = this.course;
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
      const course = this.course;
      this.set('endDate', course.get('endDate'));
    },
    changeExternalId() {
      const newExternalId = this.externalId;
      const course = this.course;
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
      const course = this.course;
      this.set('externalId', course.get('externalId'));
    },

    changeLevel(){
      this.course.set('level', this.level);
      this.course.save();
    },

    revertLevelChanges(){
      this.set('level', this.course.get('level'));
    },
  }
});
