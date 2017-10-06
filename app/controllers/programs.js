import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

const { Controller, computed, inject, isBlank, isEmpty, isPresent, RSVP } = Ember;
const { resolve } = RSVP;
const { service } = inject;
const { gt } = computed;

export default Controller.extend({
  currentUser: service(),
  i18n: service(),

  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },

  schoolId: null,
  titleFilter: null,

  changeTitleFilter: task(function * (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  filteredPrograms: computed('changeTitleFilter.lastSuccessful.value', 'programs.[]', async function() {
    let title = this.get('changeTitleFilter.lastSuccessful.value');
    if (!isPresent(title)) {
      const titleFilter = this.get('titleFilter');
      title = isBlank(titleFilter) ? '' : titleFilter ;
    }
    const cleanTitle = escapeRegExp(title);
    let exp = new RegExp(cleanTitle, 'gi');

    const programs = await this.get('programs');
    let filteredPrograms;
    if(isEmpty(cleanTitle)){
      filteredPrograms = programs;
    } else {
      filteredPrograms = programs.filter(program => {
        return isPresent(program.get('title')) && program.get('title').match(exp);
      });
    }
    return filteredPrograms.sortBy('title');
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

  programs: computed('selectedSchool', 'saved', async function() {
    let schoolId = this.get('selectedSchool').get('id');
    if(isEmpty(schoolId)) {
      return resolve([]);
    }

    return await this.get('store').query('program', {
      filters: {
        school: schoolId
      }
    });
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
