import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

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
    this.set('debouncedFilter', this.get('titleFilter'));
  },

  hasMoreThanOneSchool: gt('model.length', 1),

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
  selectedSchool: computed('model.[]', 'schoolId', function(){
    let schools = this.get('model');
    if(isPresent(this.get('schoolId'))){
      let school =  schools.find(school => {
        return school.get('id') === this.get('schoolId');
      });
      if(school){
        return school;
      }
    }
    return schools.get('firstObject');
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
      this.get('model').removeObject(program);
      program.deleteRecord();
      program.save();
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

    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
    },
  }
});
