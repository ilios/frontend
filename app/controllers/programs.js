import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";
import escapeRegExp from '../utils/escape-reg-exp';

const { Controller, computed, inject, isEmpty, isPresent, observer, RSVP, run } = Ember;
const { service } = inject;
const { gt } = computed;
const { debounce } = run;
const { PromiseArray } = DS;

export default Controller.extend({
  currentUser: service(),
  i18n: service(),

  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },

  placeholderValue: t('general.programTitleFilterPlaceholder'),

  schoolId: null,
  titleFilter: null,

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

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  filteredPrograms: computed('debouncedFilter', 'programs.[]', {
    get() {
      let defer = RSVP.defer();
      let title = this.get('debouncedFilter');
      let exp = new RegExp(title, 'gi');

      this.get('programs').then(programs => {
        let filteredPrograms;

        if(isEmpty(title)){
          filteredPrograms = programs;
        } else {
          filteredPrograms = programs.filter(program => {
            return isPresent(program.get('title')) && program.get('title').match(exp);
          });
        }

        defer.resolve(filteredPrograms.sortBy('title'));
      });

      return PromiseArray.create({
        promise: defer.promise
      });
    }
  }),
  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    if(isPresent(this.get('schoolId'))){
      const schoolId = this.get('schoolId');
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),

  programs: computed('selectedSchool', 'saved', {
    get() {
      let defer = RSVP.defer();
      let schoolId = this.get('selectedSchool').get('id');

      if(isEmpty(schoolId)) {
        defer.resolve([]);
      } else {
        this.get('store').query('program', {
          filters: {
            school: schoolId
          },
          limit: 500
        }).then(programs => {
          defer.resolve(programs);
        });
      }

      return PromiseArray.create({
        promise: defer.promise
      });
    }
  }),

  editorOn: false,

  saved: false,
  removed: false,
  savedProgram: null,

  actions: {
    toggleEditor() {
      if (this.get('editorOn')) {
        this.set('editorOn', false);
      } else {
        this.setProperties({ editorOn: true, saved: false });
      }
    },

    editProgram(program) {
      this.transitionToRoute('program', program);
    },

    removeProgram(program) {
      this.get('model.schools').removeObject(program);
      program.deleteRecord();
      return program.save().then((savedProgram) => {
        this.setProperties({ deleted: true, saved: false, savedProgram });
      });
    },

    save(program) {
      const school = this.get('selectedSchool');
      const duration = 4;

      program.setProperties({school, duration});

      return program.save().then((savedProgram) => {
        this.send('cancel');
        this.setProperties({ saved: true, savedProgram });
      });
    },

    cancel() {
      this.set('editorOn', false);
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
  }
});
