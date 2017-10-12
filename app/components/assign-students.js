import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import moment from 'moment';

const { reads } = computed;
const { Promise } = RSVP;

export default Component.extend({
  store: service(),
  flashMessages: service(),

  init(){
    this._super(...arguments);
    this.set('selectedUserIds', []);
    this.set('savedUserIds', []);
  },

  didReceiveAttrs(){
    this._super(...arguments);
    this.get('loadCohorts').perform();
  },
  students: [],
  school: null,
  offset: null,
  limit: null,

  primaryCohortId: null,
  selectedUserIds: [],
  savedUserIds: [],
  isSaving: false,

  bestSelectedCohort: computed('cohorts.[]', 'primaryCohortId', function(){
    return new Promise(resolve => {
      const primaryCohortId = this.get('primaryCohortId');
      const cohorts = this.get('cohorts');
      if (primaryCohortId) {
        let currentCohort = cohorts.find(cohort => cohort.id === primaryCohortId);
        if (currentCohort) {
          resolve(currentCohort);
          return;
        }
      }
      resolve(cohorts.get('lastObject'));
    });
  }),

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
      return (!savedUserIds.includes(user.get('id')));
    }).sortBy('lastName', 'firstName').slice(offset, end);
  }),

  cohorts: reads('loadCohorts.lastSuccessful.value'),
  loadCohorts: task(function * () {
    let school = this.get('school');
    let cohorts = yield this.get('store').query('cohort', {
      filters: {
        schools: [school.get('id')],
      },
    });

    //prefetch programYears and programs so that ember data will coalesce these requests.
    let programYears = yield RSVP.all(cohorts.getEach('programYear'));
    yield RSVP.all(programYears.getEach('program'));

    cohorts = cohorts.toArray();
    let all = [];

    for(let i = 0; i < cohorts.length; i++){
      let cohort = cohorts[i];
      let obj = {
        id: cohort.get('id'),
        model: cohort
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
      return ids.includes(user.get('id'));
    });
    if (!cohort || studentsToModify.length < 1) {
      return;
    }
    studentsToModify.setEach('primaryCohort', cohort.model);

    while (studentsToModify.get('length') > 0){
      let parts = studentsToModify.splice(0, 3);
      yield RSVP.all(parts.invoke('save'));
      this.get('savedUserIds').pushObjects(parts.mapBy('id'));
    }
    this.set('isSaving', false);
    this.set('selectedUserIds', []);

    this.get('flashMessages').success('general.savedSuccessfully');

  }).drop(),

  totalUnassignedStudents: computed('students.length', 'savedUserIds.length', function(){
    const students = this.get('students.length');
    const saved = this.get('savedUserIds.length');

    return students - saved;
  }),

  actions: {
    toggleCheck(){
      const currentlySelected = this.get('selectedUserIds.length');
      const totalDisplayed = this.get('filteredStudents.length');
      if (currentlySelected < totalDisplayed) {
        let users = this.get('filteredStudents');
        this.set('selectedUserIds', users.mapBy('id'));
      } else {
        this.set('selectedUserIds', []);
      }
    },
    toggleUserSelection(userId){
      if (this.get('selectedUserIds').includes(userId)) {
        this.get('selectedUserIds').removeObject(userId);
      } else {
        this.get('selectedUserIds').pushObject(userId);
      }
    }
  }
});
