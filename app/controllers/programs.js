import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { computed, RSVP, isEmpty, isPresent, inject } = Ember;
const { gt } = computed;
const { service } = inject;
const { PromiseArray } = DS;

export default Ember.Controller.extend({
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },
  placeholderValue: t('programs.titleFilterPlaceholder'),
  schoolId: null,
  titleFilter: null,
  showNewProgramForm: false,
  newPrograms: [],
  programs: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    let schoolId = this.get('selectedSchool').get('id');
    if(isEmpty(schoolId)){
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
  }),
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: gt('model.length', 1),
  filteredPrograms: computed(
    'debouncedFilter',
    'programs.[]',
    function(){
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
  actions: {
    removeProgram: function(program){
      program.deleteRecord();
      program.save();
    },
    saveNewProgram: function(newProgram){
      newProgram.save().then(savedProgram => {
        this.get('newPrograms').pushObject(savedProgram);
        this.set('showNewProgramForm', false);
      });
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
    },
    toggleNewProgramForm: function(){
      this.set('showNewProgramForm', !this.get('showNewProgramForm'));
    }
  },
});
