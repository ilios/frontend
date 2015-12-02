import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

const { computed, Controller, inject, observer, run } = Ember;
const { service } = inject;
const { debounce } = run;
const { gt } = computed;

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

  model: [],

  placeholderValue: t('learnerGroups.titleFilterPlaceholder'),

  schoolId: null,
  programId: null,
  programYearId: null,
  titleFilter: null,

  schools: [],
  programs: [],
  programYears: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,

  watchFilter: observer('titleFilter', function() {
    debounce(this, this.setFilter, 500);
  }),

  setFilter() {
    this.set('debouncedFilter', this.get('titleFilter'));
  },

  hasMoreThanOneSchool: gt('schools.length', 1),
  hasMoreThanOneProgram: gt('programs.length', 1),
  hasMoreThanOneProgramYear: gt('programYears.length', 1),

  filteredLearnerGroups: computed('debouncedFilter', 'model.[]', {
    get() {
      const title = this.get('debouncedFilter');
      const model = this.get('model');
      const exp = new RegExp(title, 'gi');

      return model.filter((learnerGroup) => {
        let match = true;

        if (title != null && !learnerGroup.get('title').match(exp)) {
          match = false;
        }

        return match;
      }).sortBy('title');
    }
  }).readOnly(),

  showNewLearnerGroupForm: false,

  actions: {
    editLearnerGroup(learnerGroup) {
      this.transitionToRoute('learnerGroup', learnerGroup);
    },

    removeLearnerGroup(learnerGroup) {
      this.get('model').removeObject(learnerGroup);
      learnerGroup.destroyRecord();
    },

    toggleNewLearnerGroupForm() {
      this.set('showNewLearnerGroupForm', !this.get('showNewLearnerGroupForm'));
    },

    saveNewLearnerGroup(title) {
      const { selectedProgramYear, store, model } = this.getProperties('selectedProgramYear', 'store', 'model');

      selectedProgramYear.get('cohort').then((cohort) => {
        const newLearnerGroup = store.createRecord('learner-group', { title, cohort });

        newLearnerGroup.save().then((savedLearnerGroup) => {
          model.pushObject(savedLearnerGroup);
          this.send('cancel');
        });
      });
    },

    cancel() {
      this.set('showNewLearnerGroupForm', false);
    },

    changeSelectedProgram(program) {
      this.setProperties({ programId: program.get('id'), selectedProgram: program });
    },

    changeSelectedProgramYear(programYear) {
      this.setProperties({ programYearId: programYear.get('id'), selectedProgramYear: programYear });
    },

    changeSelectedSchool(school) {
      this.setProperties({ schoolId: school.get('id'), selectedSchool: school });
    }
  }
});
