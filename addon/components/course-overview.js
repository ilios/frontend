/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import layout from '../templates/components/course-overview';
import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { Promise as RSVPPromise } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const { reads } = computed;

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
  layout,
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
  manageDirectors: false,
  showDirectorManagerLoader: true,
  currentRoute: '',
  selectedClerkshipType: computed('clerkshipTypeId', 'clerkshipTypeOptions.[]', async function() {
    const id = this.get('clerkshipTypeId');
    const clerkshipTypeOptions = await this.get('clerkshipTypeOptions');
    if (isEmpty(id)) {
      return null;
    }

    return clerkshipTypeOptions.findBy('id', id);
  }),
  directorsToPassToManager: task(function * () {
    const course = this.get('course');

    let users = yield course.get('directors');

    this.set('showDirectorManagerLoader', false);
    return users;
  }).restartable(),

  showRollover: computed('course', 'routing.currentRouteName', async function () {
    const routing = this.get('routing');
    if (routing.get('currentRouteName') === 'course.rollover') {
      return false;
    }

    const permissionChecker = this.get('permissionChecker');
    const course = this.get('course');
    const school = await course.get('school');
    return permissionChecker.canCreateCourse(school);
  }),

  clerkshipTypeTitle: computed('selectedClerkshipType', async function () {
    const selectedClerkshipType = await this.get('selectedClerkshipType');
    const i18n = this.get('i18n');
    if (!selectedClerkshipType) {
      return i18n.t('general.notAClerkship');
    }

    return selectedClerkshipType.title;
  }),

  clerkshipTypeOptions: computed(async function () {
    const store = this.get('store');
    return store.findAll('course-clerkship-type');
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
    async changeClerkshipType(){
      const course = this.get('course');
      const selectedClerkshipType = await this.get('selectedClerkshipType');
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
      return new RSVPPromise((resolve, reject) => {
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
      return new RSVPPromise((resolve, reject) => {
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
      return new RSVPPromise((resolve, reject) => {
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
