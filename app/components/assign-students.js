import Ember from 'ember';
import { task } from 'ember-concurrency';
import moment from 'moment';

const { Component, computed, RSVP, inject, isEmpty } = Ember;
const { reads } = computed;
const { service } = inject;
const { Promise } = RSVP;

export default Component.extend({
  store: service(),
  flashMessages: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    this.get('loadCohorts').perform();
    this.set('selectedUserIds', []);
    this.set('savedUserIds', []);
  },
  students: [],
  school: null,
  offset: null,
  limit: null,

  primaryCohortId: null,
  selectedUserIds: [],
  savedUserIds: [],
  isSaving: false,

  bestSelectedCohort: computed('school.cohorts.[]', 'primaryCohortId', {
    get(){
      return new Promise(resolve => {
        const primaryCohortId = this.get('primaryCohortId');
        let school = this.get('school');
        school.get('cohorts').then(cohorts => {
          if (primaryCohortId) {
            let currentCohort = cohorts.find(cohort => cohort.get('id') === primaryCohortId);
            if (currentCohort) {
              resolve(currentCohort);
              return;
            }
          }
          resolve(cohorts.get('lastObject'));
        });
      });
    }
  }).readOnly(),

  filteredStudents: computed('savedUserIds.[]', 'students.[]', 'offset', 'limit', function(){
    const limit = this.get('limit');
    const offset = this.get('offset');
    const end = limit + offset;
    const savedUserIds = this.get('savedUserIds');
    let students = this.get('students');

    if (isEmpty(students)) {
      return [];
    }
    return students.filter(user => {
      return (!savedUserIds.contains(user.get('id')))
    }).sortBy('lastName', 'firstName').slice(offset, end);
  }),

  cohorts: reads('loadCohorts.lastSuccessful.value'),
  loadCohorts: task(function * () {
    let school = this.get('school');
    let cohorts = yield this.get('store').query('cohort', {
      filters: {
        schools: [school.get('id')],
      },
      limit: 1000,
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    let programYears = yield RSVP.all(cohorts.getEach('programYear'));
    yield RSVP.all(programYears.getEach('program'));

    cohorts = cohorts.toArray();
    let all = [];

    for(let i = 0; i < cohorts.length; i++){
      let cohort = cohorts[i];
      let obj = {
        id: cohort.get('id')
      };
      let programYear = yield cohort.get('programYear');
      let program = yield programYear.get('program');
      obj.title = program.get('title') + ' ' + cohort.get('title');
      obj.startYear = programYear.get('startYear');
      obj.duration = program.get('duration');

      all.pushObject(obj);
    }

    let lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'));
    return all.filter(obj=> {

      let finalYear = parseInt(obj.startYear) + parseInt(obj.duration);
      return finalYear > lastYear;
    });

  }).restartable(),

  save: task(function * () {
    this.set('savedUserIds', []);
    this.set('isSaving', true);
    let ids = this.get('selectedUserIds');
    let cohort = yield this.get('bestSelectedCohort');
    let students = this.get('students');
    let studentsToModify = students.filter(user => {
      return ids.contains(user.get('id'));
    });
    studentsToModify.setEach('primaryCohort', cohort);

    while (studentsToModify.get('length') > 0){
      let parts = studentsToModify.splice(0, 3);
      yield RSVP.all(parts.invoke('save'));
      this.get('savedUserIds').pushObjects(parts.mapBy('id'));
    }
    this.set('isSaving', false);
    this.set('selectedUserIds', []);

    this.get('flashMessages').success('general.savedSuccessfully');

  }).drop(),

  actions: {
    toggleCheck(){
      if (isEmpty(this.get('selectedUserIds'))) {
        let users = this.get('filteredStudents');
        this.set('selectedUserIds', users.mapBy('id'));
      } else {
        this.set('selectedUserIds', []);
      }
    },
    setPrimaryCohort(id){
      this.set('primaryCohortId', id);
    },
    toggleUserSelection(userId){
      if (this.get('selectedUserIds').contains(userId)) {
        this.get('selectedUserIds').removeObject(userId);
      } else {
        this.get('selectedUserIds').pushObject(userId);
      }
    }
  }
});
