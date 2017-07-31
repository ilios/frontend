import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";
import escapeRegExp from '../utils/escape-reg-exp';

const { computed, Controller, inject, observer, run, isPresent, isEmpty, RSVP } = Ember;
const { service } = inject;
const { debounce } = run;
const { gt, oneWay, sort } = computed;
const { PromiseArray, PromiseObject } = DS;

export default Controller.extend({
  currentUser: service(),
  i18n: service(),
  store: service(),

  queryParams: {
    schoolId: 'school',
    programId: 'program',
    programYearId: 'programYear',
    titleFilter: 'filter',
  },

  placeholderValue: t('general.learnerGroupTitleFilterPlaceholder'),

  schoolId: null,
  programId: null,
  programYearId: null,
  titleFilter: null,
  saved: false,
  savedGroup: null,

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,

  watchFilter: observer('titleFilter', function() {
    debounce(this, this.setFilter, 500);
  }),

  setFilter() {
    const titleFilter = this.get('titleFilter');
    const clean = escapeRegExp(titleFilter);
    this.set('debouncedFilter', clean);
  },

  schools: oneWay('model.schools'),

  sortByTitle:['title'],
  sortedSchools: sort('schools', 'sortByTitle'),
  hasMoreThanOneSchool: gt('schools.length', 1),

  programs: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    this.get('selectedSchool').then(school => {
      if(isEmpty(school)){
        defer.resolve([]);
      } else {
        this.get('store').query('program', {
          filters: {
            school: school.get('id'),
            published: true
          }
        }).then(programs => {
          defer.resolve(programs);
        });
      }
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  sortedPrograms: sort('programs', 'sortByTitle'),
  hasMoreThanOneProgram: gt('programs.length', 1),

  programYears: computed('selectedProgram.programYears.[]', function(){
    let defer = RSVP.defer();
    this.get('selectedProgram').then(program => {
      if(isEmpty(program)){
        defer.resolve([]);
      } else {
        this.get('store').query('programYear', {
          filters: {
            program: program.get('id'),
            published: true
          }
        }).then(programs => {
          defer.resolve(programs);
        });
      }
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  sortByStartYear: ['startYear:desc'],
  sortedProgramYears: sort('programYears', 'sortByStartYear'),
  hasMoreThanOneProgramYear: gt('programYears.length', 1),

  learnerGroups: computed('selectedProgramYear.cohort.topLevelLearnerGroups.[]', function(){
    let defer = RSVP.defer();
    this.get('selectedProgramYear').then(programYear => {
      if(isEmpty(programYear)){
        defer.resolve([]);
      } else {
        programYear.get('cohort').then(cohort => {
          cohort.get('topLevelLearnerGroups').then(groups => {
            defer.resolve(groups);
          });
        });
      }
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  filteredLearnerGroups: computed('debouncedFilter', 'learnerGroups.[]', {
    get() {
      const title = this.get('debouncedFilter');
      const learnerGroups = this.get('learnerGroups');
      const exp = new RegExp(title, 'gi');

      return learnerGroups.filter((learnerGroup) => {
        let match = true;

        if (title != null && !learnerGroup.get('title').match(exp)) {
          match = false;
        }

        return match;
      }).sortBy('title');
    }
  }).readOnly(),

  showNewLearnerGroupForm: false,

  selectedSchool: computed('model.schools.[]', 'schoolId', function(){
    let schools = this.get('model.schools');
    const schoolId = this.get('schoolId');
    if(isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);
      if(school){
        return PromiseObject.create({
          promise: RSVP.resolve(school)
        });
      }
    }
    return PromiseObject.create({
      promise: this.get('currentUser').get('model').then(user => {
        return user.get('school').then(school => {
          return school;
        });
      })
    });
  }),

  selectedProgram: computed('programs.[]', 'programId', function(){
    let defer = RSVP.defer();
    this.get('programs').then(programs => {
      let program;
      const programId = this.get('programId');
      if(isPresent(programId)){
        program = programs.findBy('id', programId);
      }
      if(program){
        defer.resolve(program);
      } else {
        if(programs.length > 1){
          defer.resolve(null);
        } else {
          defer.resolve(programs.sortBy('title').get('firstObject'));
        }
      }
    });


    return PromiseObject.create({
      promise: defer.promise
    });
  }),

  selectedProgramYear: computed('programYears.[]', 'programYearId', function(){
    let defer = RSVP.defer();
    this.get('programYears').then(programYears => {
      let programYear;
      const programYearId = this.get('programYearId');
      if(isPresent(programYearId)){
        programYear = programYears.findBy('id', programYearId);
      }
      if(programYear){
        defer.resolve(programYear);
      } else {
        defer.resolve(programYears.sortBy('startYear').get('lastObject'));
      }
    });

    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  actions: {
    editLearnerGroup(learnerGroup) {
      this.transitionToRoute('learnerGroup', learnerGroup);
    },

    removeLearnerGroup(learnerGroup) {
      return learnerGroup.destroyRecord();
    },

    toggleNewLearnerGroupForm() {
      this.set('showNewLearnerGroupForm', !this.get('showNewLearnerGroupForm'));
    },

    saveNewLearnerGroup(title, fillWithCohort) {
      const { selectedProgramYear, store } = this.getProperties('selectedProgramYear', 'store');

      return selectedProgramYear.get('cohort').then((cohort) => {
        const newLearnerGroup = store.createRecord('learner-group', { title, cohort });
        if (fillWithCohort) {
          return cohort.get('users').then(users => {
            newLearnerGroup.get('users').pushObjects(users);
            return newLearnerGroup.save().then(() => {
              this.set('saved', true);
              this.set('savedGroup', newLearnerGroup);
              this.send('cancel');
            });
          });
        } else {
          return newLearnerGroup.save().then(() => {
            this.set('saved', true);
            this.set('savedGroup', newLearnerGroup);
            this.send('cancel');
          });
        }
      });
    },

    cancel() {
      this.set('showNewLearnerGroupForm', false);
    },

    changeSelectedProgram(programId) {
      let program = this.get('programs').findBy('id', programId);
      program.get('school').then(school => {
        this.set('schoolId', school.get('id'));
        this.set('programId', programId);
        this.set('programYearId', null);
      });
    },

    changeSelectedProgramYear(programYearId) {
      let programYear = this.get('programYears').findBy('id', programYearId);
      programYear.get('program').then(program => {
        program.get('school').then(school => {
          this.set('schoolId', school.get('id'));
          this.set('programId', program.get('id'));
          this.set('programYearId', programYearId);
        });
      });
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
      this.set('programId', null);
      this.set('programYearId', null);
    }
  }
});
