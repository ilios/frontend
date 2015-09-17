import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  i18n: Ember.inject.service(),
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
  newLearnerGroups: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  hasMoreThanOneProgram: Ember.computed.gt('programs.length', 1),
  hasMoreThanOneProgramYear: Ember.computed.gt('programYears.length', 1),
  filteredLearnerGroups: function(){
    var title = this.get('debouncedFilter');
    var exp = new RegExp(title, 'gi');
    return this.get('model').filter(function(learnerGroup) {
      let match = true;
      if(title != null && !learnerGroup.get('title').match(exp)){
        match = false;
      }

      return match;
    }).sortBy('title');
  }.property('debouncedFilter', 'model.[]'),
  actions: {
    editLearnerGroup: function(learnerGroup){
      this.transitionToRoute('learnerGroup', learnerGroup);
    },
    removeLearnerGroup: function(learnerGroup){
      this.get('model').removeObject(learnerGroup);
      learnerGroup.deleteRecord();
      learnerGroup.save();
    },
    addLearnerGroup: function(){
      var learnerGroup = this.store.createRecord('learner-group', {
        title: null,
        cohort: this.get('cohort'),
      });
      this.get('newLearnerGroups').addObject(learnerGroup);
    },
    saveNewLearnerGroup: function(newLearnerGroup){
      var self = this;
      self.get('newLearnerGroups').removeObject(newLearnerGroup);
      newLearnerGroup.save();
    },
    removeNewLearnerGroup: function(newLearnerGroup){
      this.get('newLearnerGroups').removeObject(newLearnerGroup);
    },
    changeSelectedProgram: function(program){
      this.set('programId', program.get('id'));
      this.set('selectedProgram', program);
    },
    changeSelectedProgramYear: function(programYear){
      this.set('programYearId', programYear.get('id'));
      this.set('selectedProgramYear', programYear);
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
      this.set('selectedSchool', school);
    }
  },
});
