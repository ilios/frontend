import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { Controller, computed, inject, observer, run } = Ember;
const { service } = inject;
const { gt } = computed;
const { debounce } = run;

export default Controller.extend({
  currentUser: service(),
  i18n: service(),

  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },

  model: [],

  placeholderValue: t('programs.titleFilterPlaceholder'),

  schoolId: null,
  titleFilter: null,
  schools: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,

  watchFilter: observer('titleFilter', function() {
    debounce(this, this.setFilter, 500);
  }),

  setFilter() {
    this.set('debouncedFilter', this.get('titleFilter'));
  },

  hasMoreThanOneSchool: gt('schools.length', 1),

  filteredPrograms: computed('debouncedFilter', 'model.[]', {
    get() {
      const title = this.get('debouncedFilter');
      const exp = new RegExp(title, 'gi');

      return this.get('model').filter((course) => {
        let match = true;

        if (title != null && !course.get('title').match(exp)) {
          match = false;
        }

        return match;
      }).sortBy('title');
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

    save(title) {
      const store = this.store;
      const school = this.get('selectedSchool');
      const duration = 4;

      let newProgram = store.createRecord('program', { title, school, duration });

      newProgram.save().then((savedProgram) => {
        this.send('cancel');
        this.setProperties({ saved: true, savedProgram });
        this.send('reloadModel');
      });
    },

    cancel() {
      this.set('editorOn', false);
    },

    changeSelectedSchool(school) {
      const schoolId = school.get('id');

      this.setProperties({ schoolId, selectedSchool: school });
    }
  }
});
