import Ember from 'ember';
import DS from 'ember-data';

const { computed, inject, RSVP, isEmpty } = Ember;
const { service } = inject;
const { PromiseArray } = DS;

export default Ember.Component.extend({
  store: service(),
  i18n: service(),
  currentUser: service(),
  flashMessages: service(),
  classNames: ['form-container', 'detail-view', 'new-myreport', 'mesh-manager'],
  title: null,
  currentSubject: 'course',
  currentPrepositionalObject: null,
  currentPrepositionalObjectId: null,
  isAssociatedTo: false,
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
      {value: 'topic', label: this.get('i18n').t('general.topics')},
      {value: 'mesh term', label: this.get('i18n').t('general.meshTerms')},
      {value: 'session type', label: this.get('i18n').t('general.sessionTypes')},
    ];
    
    return list;
  }),
  prepositionalObjectList: computed('i18n.locale', 'currentSubject', function(){
    let list = [
      {value: 'course', label: this.get('i18n').t('general.courses'), subjects: ['session', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'topic', 'mesh term']},
      {value: 'session', label: this.get('i18n').t('general.sessions'), subjects: ['course', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'topic', 'mesh term', 'session type']},
      {value: 'program', label: this.get('i18n').t('general.programs'), subjects: ['course', 'session', 'topic']},
      {value: 'program year', label: this.get('i18n').t('general.programYears'), subjects: ['course', 'session', 'topic']},
      {value: 'instructor', label: this.get('i18n').t('general.instructors'), subjects: ['course', 'session', 'instructor group', 'learning material', 'topic', 'session type']},
      {value: 'instructor group', label: this.get('i18n').t('general.instructorGroups'), subjects: ['course', 'session', 'instructor', 'learning material', 'topic', 'session type']},
      {value: 'learning material', label: this.get('i18n').t('general.learningMaterials'), subjects: ['course', 'session', 'instructor', 'instructor group', 'topic', 'mesh term', 'sessiontype']},
      {value: 'competency', label: this.get('i18n').t('general.competencies'), subjects: ['course', 'session', 'topic', 'session type']},
      {value: 'topic', label: this.get('i18n').t('general.topics'), subjects: ['course', 'session', 'program', 'program year', 'instructor', 'instructor group', 'learning material', 'competency', 'mesh term']},
      {value: 'mesh term', label: this.get('i18n').t('general.meshTerms'), subjects: ['course', 'session', 'learning material', 'topic', 'session type']},
      {value: 'session type', label: this.get('i18n').t('general.sessionTypes'), subjects: ['session', 'instructor', 'instructor group', 'learning material', 'competency', 'topic', 'mesh term']},
    ];
    
    const subject = this.get('currentSubject');
    
    return list.filter(item =>item.subjects.contains(subject));
  }),
  prepositionalObjectIdList: computed('currentPrepositionalObject', 'isAssociatedTo', function(){
    const type = this.get('currentPrepositionalObject');
    if(isEmpty(type) || type === 'instructor' || !this.get('isAssociatedTo')){
      return [];
    }
    let defer = RSVP.defer();
    let model = type.dasherize();
    const store = this.get('store');
    let query = {
      limit: 1000
    };
    store.query(model, query).then(objects => {
      if(type === 'program year'){
        RSVP.all(objects.mapBy('cohort')).then(cohorts => {
          let promises = [];
          let values = [];
          cohorts.forEach(cohort => {
            promises.pushObject(cohort.get('programYear').then(programYear => {
              return programYear.get('program').then(program => {
                return program.get('school').then(school => {
                  let value = programYear.get('id');
                  let label = school.get('title') + ' ' +
                    program.get('title') + ' ' +
                    cohort.get('displayTitle');
                  values.pushObject({value,label});
                });
              });
            }));
            RSVP.all(promises).then(()=> {
              defer.resolve(values.sortBy('label'));
            });
          });
        });
      } else {
        let label = type === 'mesh term'?'name':'title';
        let values = objects.map(object => {
          return {
            value: object.get('id'),
            label: object.get(label)
          };
        }).sortBy('label');
        
        defer.resolve(values);
      }
      
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
  actions: {
    changeSubject(subject){
      this.set('currentSubject', subject);
    },
    changePrepositionalObject(object){
      this.set('currentPrepositionalObject', object);
      this.set('currentPrepositionalObjectId', null);
    },
    changePrepositionalObjectId(id){
      this.set('currentPrepositionalObjectId', id);
    },
    toggleIsAssciatedTo(){
      this.set('isAssociatedTo', !this.get('isAssociatedTo'));
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
      const flashMessages = this.get('flashMessages');
      const store = this.get('store');
      let object = this.get('currentPrepositionalObject');
      if(
        object &&
        !this.get('currentPrepositionalObjectId')
      ) {
        if(object === 'instructor'){
          flashMessages.alert('dashboard.reportMissingInstructor');
        }
        if(object === 'mesh term'){
          flashMessages.alert('dashboard.reportMissingMeshTerm');
        }
        return;
      }
      this.get('currentUser.model').then(user => {
        
        let title = this.get('title');
        let subject = this.get('currentSubject');
        let prepositionalObject = this.get('currentPrepositionalObject');
        let prepositionalObjectTableRowId = this.get('currentPrepositionalObjectId');
        let report = store.createRecord('report', {
          title,
          user,
          subject,
          prepositionalObject,
          prepositionalObjectTableRowId
        });
        
        report.save().then(() => {
          this.sendAction('close');
        });
      });
    }
  }
});
