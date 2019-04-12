import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import RSVP from 'rsvp';
import { task } from 'ember-concurrency';
import moment from 'moment';

export default Component.extend({
  flashMessages: service(),
  store: service(),

  classNames: ['students'],

  school: null,
  students: null,

  isSaving: false,
  primaryCohortId: null,
  savedUserIds: null,
  selectedUserIds: null,

  cohorts: reads('loadCohorts.lastSuccessful.value'),
  isLoading: reads('loadCohorts.isRunning'),

  bestSelectedCohort: computed('cohorts.[]', 'primaryCohortId', function() {
    const cohorts = this.cohorts;
    const primaryCohortId = this.primaryCohortId;

    if (isEmpty(cohorts)) {
      return false;
    }

    if (primaryCohortId) {
      const currentCohort = cohorts.find((cohort) => cohort.id === primaryCohortId);
      return currentCohort ? currentCohort : false;
    } else {
      return cohorts.lastObject;
    }
  }),

  filteredStudents: computed('savedUserIds.[]', 'students.[]', function(){
    const savedUserIds = this.savedUserIds;
    const students = this.students;
    return isPresent(students)
      ? students.filter((user) => !savedUserIds.includes(user.id))
      : [];
  }),

  totalUnassignedStudents: computed('students.length', 'savedUserIds.length', function(){
    const students = this.get('students.length');
    const saved = this.get('savedUserIds.length');
    return students - saved;
  }),

  loadCohorts: task(function * () {
    let school = this.school;
    let cohorts = yield this.store.query('cohort', {
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

    let lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    return all.filter(obj=> {
      let finalYear = parseInt(obj.startYear, 10) + parseInt(obj.duration, 10);
      return finalYear > lastYear;
    });
  }).restartable().on('didReceiveAttrs'),

  init() {
    this._super(...arguments);
    this.setProperties({ savedUserIds: [], selectedUserIds: [] });
  },

  actions: {
    toggleCheck() {
      const currentlySelected = this.selectedUserIds.length;
      const totalDisplayed = this.filteredStudents.length;
      const selectedUserIds = currentlySelected < totalDisplayed
        ? this.filteredStudents.mapBy('id')
        : [];
      this.set('selectedUserIds', selectedUserIds);
    },

    toggleUserSelection(userId){
      if (this.selectedUserIds.includes(userId)) {
        this.selectedUserIds.removeObject(userId);
      } else {
        this.selectedUserIds.pushObject(userId);
      }
    }
  },

  save: task(function * () {
    this.set('savedUserIds', []);
    this.set('isSaving', true);
    let ids = this.selectedUserIds;
    let cohort = yield this.bestSelectedCohort;
    let students = this.students;
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
      this.savedUserIds.pushObjects(parts.mapBy('id'));
    }
    this.set('isSaving', false);
    this.set('selectedUserIds', []);

    this.flashMessages.success('general.savedSuccessfully');
  }).drop()
});
