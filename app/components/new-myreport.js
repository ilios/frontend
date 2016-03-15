import Ember from 'ember';
import DS from 'ember-data';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, inject, RSVP, isEmpty, isPresent } = Ember;
const { service } = inject;
const { PromiseArray } = DS;

export default Component.extend(EmberValidations, ValidationError, {
  init() {
    this._super(...arguments);
  },
  store: service(),
  i18n: service(),
  currentUser: service(),
  flashMessages: service(),
  classNames: ['form-container', 'detail-view', 'new-myreport', 'mesh-manager'],
  title: null,
  currentSchool: null,
  currentSubject: 'course',
  currentPrepositionalObject: null,
  currentPrepositionalObjectId: null,

  validations: {
    title : {
      length: {maximum: 240, allowBlank: true, messages: { tooLong: "myreport.errors.titleTooLong" }}
    }
  },

  subjectList: computed('i18n.locale', function(){
    let list = [
      {value: 'course', label: this.get('i18n').t('general.courses')},
      {value: 'session', label: this.get('i18n').t('general.sessions')},
      {value: 'program', label: this.get('i18n').t('general.programs')},
      {value: 'program year', label: this.get('i18n').t('general.programYears')},
      {value: 'instructor', label: this.get('i18n').t('general.instructors')},
      {value: 'instructor group', label: this.get('i18n').t('general.instructorGroups')},
      {value: 'learning material', label: this.get('i18n').t('general.learningMaterials')},
      {value: 'competency', label: this.get('i18n').t('general.competencies')},
      {value: 'mesh term', label: this.get('i18n').t('general.meshTerms')},
      {value: 'session type', label: this.get('i18n').t('general.sessionTypes')},
    ];

    return list;
  }),
  prepositionalObjectList: computed('i18n.locale', 'currentSubject', function(){
    let list = [
      {value: 'course', label: this.get('i18n').t('general.course'), subjects: ['session', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term', 'session type']},
      {value: 'session', label: this.get('i18n').t('general.session'), subjects: ['course', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term']},
      {value: 'program', label: this.get('i18n').t('general.program'), subjects: ['course', 'session', 'session type']},
      {value: 'instructor', label: this.get('i18n').t('general.instructor'), subjects: ['course', 'session', 'instructor group', 'learning material', 'session type']},
      {value: 'instructor group', label: this.get('i18n').t('general.instructorGroup'), subjects: ['course', 'session', 'instructor', 'learning material', 'session type']},
      {value: 'learning material', label: this.get('i18n').t('general.learningMaterial'), subjects: ['course', 'session', 'instructor', 'instructor group', 'mesh term', 'session type']},
      {value: 'competency', label: this.get('i18n').t('general.competency'), subjects: ['course', 'session', 'session type']},
      {value: 'mesh term', label: this.get('i18n').t('general.meshTerm'), subjects: ['course', 'session', 'learning material', 'session type']},
      {value: 'session type', label: this.get('i18n').t('general.sessionType'), subjects: ['session', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term']},
    ];

    const subject = this.get('currentSubject');

    return list.filter(item =>item.subjects.contains(subject));
  }),
  prepositionalObjectIdList: computed('currentPrepositionalObject', 'currentSchool', function(){
    const type = this.get('currentPrepositionalObject');

    let defer = RSVP.defer();
    if(isEmpty(type) || type === 'instructor'){
      defer.resolve([]);
      return PromiseArray.create({
        promise: defer.promise
      });
    }

    let model = type.dasherize();
    const store = this.get('store');
    const school = this.get('currentSchool');
    let query = {
      limit: 1000,
      filters: {}
    };
    if(isPresent(school)){
      let schoolScopedModels = [
        'session',
        'course',
        'program',
        'session-type',
        'instructor-group',
        'competency',
      ];
      if(schoolScopedModels.contains(model)) {
        if ('session' === model) {
          query.filters.schools = [this.get('currentSchool').get('id')];
        } else {
          query.filters.school = this.get('currentSchool').get('id');
        }
      }
    }

    store.query(model, query).then(objects => {
      let label = type === 'mesh term'?'name':'title';
      let values = objects.map(object => {
        return {
          value: object.get('id'),
          label: object.get(label)
        };
      }).sortBy('label');

      defer.resolve(values);
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  currentSubjectLabel: computed('currentSubject', 'subjectList.[]', function(){
    const currentSubjectValue = this.get('currentSubject');
    let currentSubject = this.get('subjectList').find(subject => {
      return subject.value === currentSubjectValue;
    });

    return currentSubject.label;
  }),
  selectedUser: computed('currentPrepositionalObject', 'currentPrepositionalObjectId', function(){
    if(
      this.get('currentPrepositionalObject') === 'instructor' &&
      this.get('currentPrepositionalObjectId')
    ){
      return this.get('store').peekRecord('user', this.get('currentPrepositionalObjectId'));
    } else {
      return null;
    }
  }),
  selectedMeshTerm: computed('currentPrepositionalObject', 'currentPrepositionalObjectId', function(){
    if(
      this.get('currentPrepositionalObject') === 'mesh term' &&
      this.get('currentPrepositionalObjectId')
    ){
      return this.get('store').peekRecord('mesh-descriptor', this.get('currentPrepositionalObjectId'));
    } else {
      return null;
    }
  }),
  schoolList: computed('currentUser.schools.[]',function(){
    let defer = RSVP.defer();
    this.get('currentUser').get('model').then(user => {
      if(isEmpty(user)){
        defer.resolve([]);
      } else {
        user.get('schools').then(schools => {
          defer.resolve(schools.sortBy('title'));
        });
      }
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    changeSchool(schoolId){
      let school = this.get('schoolList').find(school =>  school.get('id') === schoolId);
      this.set('currentSchool', school);
    },
    changeSubject(subject){
      this.set('currentSubject', subject);
      this.set('currentPrepositionalObject', null);
      this.set('currentPrepositionalObjectId', null);
    },
    changePrepositionalObject(object){
      this.set('currentPrepositionalObject', object);
      this.set('currentPrepositionalObjectId', null);
      this.get('prepositionalObjectIdList').then(list => {
        if(!this.get('currentPrepositionalObjectId')){
          let first = list.get('firstObject');
          if(first){
            this.set('currentPrepositionalObjectId', first.value);
          }
        }
      });
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
      this.sendAction('close');
    },
    save(){
      this.validate().then(() => {
        const flashMessages = this.get('flashMessages');
        const store = this.get('store');
        const subject = this.get('currentSubject');
        let object = this.get('currentPrepositionalObject');
        if (isPresent(subject) && isEmpty(object)) {
          if (subject === 'instructor') {
            flashMessages.alert('dashboard.reportMissingObjectForInstructor');
            return;
          }
          if (subject === 'mesh term') {
            flashMessages.alert('dashboard.reportMissingObjectForMeshTerm');
            return;
          }
        }
        if (
            object && !this.get('currentPrepositionalObjectId')
        ) {
          if (object === 'instructor') {
            flashMessages.alert('dashboard.reportMissingInstructor');
          }
          if (object === 'mesh term') {
            flashMessages.alert('dashboard.reportMissingMeshTerm');
          }
          return;
        }
        this.get('currentUser.model').then(user => {

          let title = this.get('title');
          let subject = this.get('currentSubject');
          let prepositionalObject = this.get('currentPrepositionalObject');
          let prepositionalObjectTableRowId = this.get('currentPrepositionalObjectId');
          let school = this.get('currentSchool');
          let report = store.createRecord('report', {
            title,
            user,
            subject,
            prepositionalObject,
            prepositionalObjectTableRowId,
            school
          });
          report.save().then(() => {
            this.sendAction('close');
          });
        });
      }).catch(() => {
        const keys = Ember.keys(this.get('errors'));
        keys.forEach((key) => {
          this.get('flashMessages').alert(this.get('errors.' + key));
        });
      });
    }
  }
});
