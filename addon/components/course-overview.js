import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import scrollTo from 'ilios-common/utils/scroll-to';

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
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),
  router: service(),
  routing: service('-routing'),
  store: service(),

  editable: false,
  universalLocator: 'ILIOS',
  'data-test-course-overview': true,
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
    const intl = this.get('intl');
    if (!selectedClerkshipType) {
      return intl.t('general.notAClerkship');
    }

    return selectedClerkshipType.title;
  }),

  clerkshipTypeOptions: computed(async function () {
    const store = this.get('store');
    return store.findAll('course-clerkship-type');
  }),

  init(){
    this._super(...arguments);

    const levelOptions = [];
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

    async changeStartDate() {
      const { course, startDate } = this.getProperties('course', 'startDate');
      this.send('addErrorDisplayFor', 'startDate');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'startDate');
        course.set('startDate', startDate);
        const newCourse = await course.save();
        this.set('startDate', newCourse.startDate);
        this.set('course', newCourse);
      } else {
        await reject();
      }
    },

    revertStartDateChanges(){
      const course = this.get('course');
      this.set('startDate', course.get('startDate'));
    },

    async changeEndDate() {
      const { course, endDate } = this.getProperties('course', 'endDate');
      this.send('addErrorDisplayFor', 'endDate');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'endDate');
        course.set('endDate', endDate);
        const newCourse = await course.save();
        this.set('endDate', newCourse.endDate);
        this.set('course', newCourse);
      } else {
        await reject();
      }
    },

    revertEndDateChanges(){
      const course = this.get('course');
      this.set('endDate', course.get('endDate'));
    },

    async changeExternalId() {
      const { course, externalId } = this.getProperties('course', 'externalId');
      this.send('addErrorDisplayFor', 'externalId');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'externalId');
        course.set('externalId', externalId);
        const newCourse = await course.save();
        this.set('externalId', newCourse.externalId);
        this.set('course', newCourse);
      } else {
        await reject();
      }
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

    transitionToRollover() {
      this.router.transitionTo('course.rollover', this.course);
      scrollTo('.rollover-form');
    }
  },

  directorsToPassToManager: task(function * () {
    const course = this.get('course');

    const users = yield course.get('directors');

    this.set('showDirectorManagerLoader', false);
    return users;
  }).restartable(),

});
