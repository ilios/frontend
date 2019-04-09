/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { isPresent, isEmpty } from '@ember/utils';
import EmberObject, { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { map, Promise } = RSVP;
const { oneWay } = computed;

const Validations = buildValidations({
  title: [
    validator('length', {
      max: 240,
      descriptionKey: 'general.title'
    }),
  ]
});

const PrepositionObject = EmberObject.extend({
  model: null,
  type: null,
  value: oneWay('model.id'),
  label: computed('model', 'type', function () {
    const type = this.type;
    const model = this.model;
    return new Promise(resolve => {
      switch (type) {
      case 'mesh term':
        resolve(model.get('name'));
        break;
      case 'term':
        model.get('vocabulary').then(vocabulary => {
          model.get('titleWithParentTitles').then(titleWithParentTitles => {
            const title = vocabulary.get('title') + ' > ' + titleWithParentTitles;
            resolve(title);
          });
        });
        break;
      default:
        resolve(model.get('title'));
      }
    });
  }),
  active: computed('model', 'type', function() {
    const type = this.type;
    if (['session type', 'term'].includes(type)) {
      return this.model.get('active');
    }
    return true;
  }),
  academicYear: computed('model', 'type', async function () {
    const type = this.type;
    const model = this.model;
    if (type === 'course') {
      return parseInt(model.get('year'), 10);
    }
    if (type === 'session') {
      let course = await model.get('course');
      return parseInt(course.get('year'), 10);
    }

    return null;
  })
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  currentUser: service(),
  flashMessages: service(),
  intl: service(),
  store: service(),

  classNames: ['mesh-manager', 'new-myreport'],

  currentPrepositionalObject: null,
  currentPrepositionalObjectId: null,
  currentSubject: 'course',
  isSaving: false,
  selectedSchool: null,
  selectedYear: null,
  schoolChanged: false,
  title: null,

  subjectList: computed('intl.locale', function(){
    let list = [
      {value: 'course', label: this.intl.t('general.courses')},
      {value: 'session', label: this.intl.t('general.sessions')},
      {value: 'program', label: this.intl.t('general.programs')},
      {value: 'program year', label: this.intl.t('general.programYears')},
      {value: 'instructor', label: this.intl.t('general.instructors')},
      {value: 'instructor group', label: this.intl.t('general.instructorGroups')},
      {value: 'learning material', label: this.intl.t('general.learningMaterials')},
      {value: 'competency', label: this.intl.t('general.competencies')},
      {value: 'mesh term', label: this.intl.t('general.meshTerms')},
      {value: 'term', label: this.intl.t('general.terms')},
      {value: 'session type', label: this.intl.t('general.sessionTypes')},
    ];

    return list;
  }),

  prepositionalObjectList: computed('intl.locale', 'currentSubject', function(){
    let list = [
      {value: 'course', label: this.intl.t('general.course'), subjects: ['session', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term', 'session type', 'term']},
      {value: 'session', label: this.intl.t('general.session'), subjects: ['course', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term', 'term']},
      {value: 'program year', label: this.intl.t('general.programYear'), subjects: ['term']},
      {value: 'program', label: this.intl.t('general.program'), subjects: ['course', 'session', 'session type', 'term']},
      {value: 'instructor', label: this.intl.t('general.instructor'), subjects: ['course', 'session', 'instructor group', 'learning material', 'session type', 'term']},
      {value: 'instructor group', label: this.intl.t('general.instructorGroup'), subjects: ['course', 'session', 'instructor', 'learning material', 'session type']},
      {value: 'learning material', label: this.intl.t('general.learningMaterial'), subjects: ['course', 'session', 'instructor', 'instructor group', 'mesh term', 'session type', 'term']},
      {value: 'competency', label: this.intl.t('general.competency'), subjects: ['course', 'session', 'session type', 'term']},
      {value: 'mesh term', label: this.intl.t('general.meshTerm'), subjects: ['course', 'session', 'learning material', 'session type', 'term']},
      {value: 'session type', label: this.intl.t('general.sessionType'), subjects: ['session', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term', 'term']},
      {value: 'term', label: this.intl.t('general.term'), subjects: ['course', 'session', 'program', 'program year', 'session type']},
    ];

    const subject = this.currentSubject;

    return list.filter(item =>item.subjects.includes(subject));
  }),

  /**
   * A list of prepositional objects. Each object has a id and label property.
   * @property prepositionalObjectIdList
   * @type {Ember.computed}
   * @public
   */
  prepositionalObjectIdList: computed('currentPrepositionalObject', 'currentSchool', async function(){
    const type = this.currentPrepositionalObject;
    if (isEmpty(type) || type === 'instructor' || type === 'mesh term') {
      return [];
    }

    let model = type.dasherize();
    const store = this.store;
    const school = await this.currentSchool;
    let query = {
      filters: {}
    };
    if (isPresent(school)) {
      let schoolScopedModels = [
        'session',
        'course',
        'program',
        'session-type',
        'instructor-group',
        'competency',
        'term',
      ];
      if (schoolScopedModels.includes(model)) {
        if ('session' === model || 'term' == model) {
          query.filters.schools = [school.get('id')];
        } else {
          query.filters.school = school.get('id');
        }
      }
    }
    const objects = await store.query(model, query);
    let values = objects.map(object => {
      return PrepositionObject.create({
        type,
        model: object,
      });
    });

    return await map(values, async obj => {
      const label = await obj.get('label');
      const value = obj.get('value');
      const active = obj.get('active');
      const academicYear = await obj.get('academicYear');
      return {value, label, active, academicYear};
    });
  }),

  /**
   * Filtered List of prepositional objects
   * @property filteredPrepositionalObjectIdList
   * @type {Ember.computed}
   * @public
   */
  filteredPrepositionalObjectIdList: computed('prepositionalObjectIdList.[]', 'selectedYear', async function () {
    const selectedYear = this.selectedYear?parseInt(this.selectedYear, 10): null;
    const objects = await this.prepositionalObjectIdList;
    const type = this.currentPrepositionalObject;

    return objects.filter(obj => {
      if (isEmpty(selectedYear) || !['course', 'session'].includes(type)) {
        return true;
      }

      return obj.academicYear === selectedYear;
    });
  }),

  currentSubjectLabel: computed('currentSubject', 'subjectList.[]', function(){
    const currentSubjectValue = this.currentSubject;
    let currentSubject = this.subjectList.find(subject => {
      return subject.value === currentSubjectValue;
    });

    return currentSubject.label;
  }),

  selectedUser: computed('currentPrepositionalObject', 'currentPrepositionalObjectId', function(){
    if(
      this.currentPrepositionalObject === 'instructor' &&
      this.currentPrepositionalObjectId
    ){
      return this.store.peekRecord('user', this.currentPrepositionalObjectId);
    } else {
      return null;
    }
  }),

  selectedMeshTerm: computed('currentPrepositionalObject', 'currentPrepositionalObjectId', function(){
    if(
      this.currentPrepositionalObject === 'mesh term' &&
      this.currentPrepositionalObjectId
    ){
      return this.store.peekRecord('mesh-descriptor', this.currentPrepositionalObjectId);
    } else {
      return null;
    }
  }),

  /**
   * All schools, sorted by title.
   * @property schoolList
   * @type {Ember.computed}
   * @public
   */
  schoolList: computed(async function(){
    const store = this.store;

    const schools = await store.findAll('school');
    return schools.sortBy('title');
  }),

  currentSchool: computed('currentUser.model.school', 'selectedSchool', async function(){
    const selectedSchool = this.selectedSchool;
    const schoolChanged = this.schoolChanged;
    if (isPresent(selectedSchool)) {
      return selectedSchool;
    }

    //if the school has been set to null intentionally
    if (schoolChanged) {
      return null;
    }

    const currentUser = this.currentUser;
    const user = await currentUser.get('model');
    const school = await user.get('school');

    return school;
  }),

  allAcademicYears: computed(async function () {
    const store = this.store;
    const years = await store.findAll('academic-year');

    return years;
  }),

  save: task(function *(){
    this.set('isSaving', true);
    this.send('addErrorDisplayFor', 'title');
    const {validations} = yield this.validate();
    if (validations.get('isInvalid')) {
      return;
    }
    const flashMessages = this.flashMessages;
    const store = this.store;
    const subject = this.currentSubject;
    const currentUser = this.currentUser;
    const user = yield currentUser.get('model');
    const title = this.title;
    const prepositionalObject = this.currentPrepositionalObject;
    const school = yield this.currentSchool;
    const object = this.currentPrepositionalObject;
    const prepositionalObjectTableRowId = this.currentPrepositionalObjectId;
    if (isPresent(subject) && isEmpty(object)) {
      if (subject === 'instructor') {
        flashMessages.alert('general.reportMissingObjectForInstructor');
        return;
      }
      if (subject === 'mesh term') {
        flashMessages.alert('general.reportMissingObjectForMeshTerm');
        return;
      }
    }
    if (
      object && isEmpty(prepositionalObjectTableRowId)
    ) {
      if (object === 'instructor') {
        flashMessages.alert('general.reportMissingInstructor');
      }
      if (object === 'mesh term') {
        flashMessages.alert('general.reportMissingMeshTerm');
      }
      return;
    }

    let report = store.createRecord('report', {
      title,
      user,
      subject,
      prepositionalObject,
      prepositionalObjectTableRowId,
      school
    });
    yield report.save();
    this.send('clearErrorDisplay', 'title');
    this.close();
  }),

  changeSchool: task(function * (schoolId) {
    const schoolList = yield this.schoolList;
    const school = schoolList.findBy('id', schoolId);
    this.set('selectedSchool', school);
    this.set('schoolChanged', true);
  }),

  resetCurrentPrepositionalObjectId: task(function* () {
    const list = yield this.filteredPrepositionalObjectIdList;
    const first = list.get('firstObject');
    if(first){
      this.set('currentPrepositionalObjectId', first.value);
    }
  }).restartable(),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if(27 === keyCode) {
      this.close();
    }
  },

  actions: {
    changeSubject(subject){
      this.set('currentSubject', subject);
      this.set('currentPrepositionalObject', null);
      this.set('currentPrepositionalObjectId', null);
    },

    changePrepositionalObject(object){
      this.set('currentPrepositionalObject', object);
      this.set('currentPrepositionalObjectId', null);
      this.resetCurrentPrepositionalObjectId.perform();
    },

    changeSelectedYear(year){
      this.set('selectedYear', year);
      this.set('currentPrepositionalObjectId', null);
      this.resetCurrentPrepositionalObjectId.perform();
    },

    changePrepositionalObjectId(id){
      this.set('currentPrepositionalObjectId', id);
    },

    chooseInstructor(user){
      this.set('currentPrepositionalObjectId', user.get('id'));
    },

    chooseMeshTerm(term){
      this.set('currentPrepositionalObjectId', term.get('id'));
    },

    closeEditor(){
      this.close();
    }
  }
});
