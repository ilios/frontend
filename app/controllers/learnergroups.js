import Ember from 'ember';

export default Ember.Controller.extend(Ember.I18n.TranslateableProperties, {
  queryParams: {
    schoolId: 'school',
    programId: 'program',
    cohortId: 'cohort',
    titleFilter: 'filter'
  },
  placeholderValueTranslation: 'learnerGroups.titleFilterPlaceholder',
  newGroupTitleTranslation: 'learnerGroups.newGroupTitle',
  schoolId: null,
  cohortId: null,
  programId: null,
  titleFilter: null,
  cohorts: [],
  sortBy: ['title'],
  sortedCohorts: Ember.computed.sort('cohorts', 'sortBy'),
  sortedPrograms: Ember.computed.sort('programs', 'sortBy'),
  sortedSchools: Ember.computed.sort('schools', 'sortBy'),
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  hasMoreThanOneProgram: Ember.computed.gt('programs.length', 1),
  filteredGroups: function(){
    var title = this.get('titleFilter');
    if(title == null){
      return this.get('content');
    }
    var exp = new RegExp(title, 'gi');
    return this.get('content').filter(function(learnerGroup) {
      return learnerGroup.get('title').match(exp);
    });
  }.property('titleFilter', 'content.@each'),
  watchSelectedSchool: function(){
    this.set('schoolId', this.get('selectedSchool.id'));
  }.observes('selectedSchool'),
  watchSelectedProgram: function(){
    this.set('programId', this.get('selectedProgram.id'));
  }.observes('selectedProgram'),
  watchSelectedCohort: function(){
    this.set('cohortId', this.get('selectedCohort.id'));
  }.observes('selectedCohort'),
  title: function(){
    var str = this.get('selectedSchool.title') +
      ' - ' + this.get('selectedProgram.title');
    if(this.get('selectedCohort')){
      str += ' - ' + this.get('selectedCohort.displayTitle');
    }
    return str;
  }.property('selectedSchool,title', 'selectedCohort,displayTitle'),
  actions: {
    editGroup: function(group){
      this.transitionToRoute('learnergroup', group);
    },
    removeGroup: function(group){
      group.deleteRecord();
      group.save();
      this.get('content').removeObject(group);
    },
    addGroup: function(){
      var self = this;
      var group = this.store.createRecord('learnerGroup', {
        title: this.get('newGroupTitle'),
        cohort: this.get('selectedCohort')
      });
      group.save().then(function(){
        self.get('content').pushObject(group);
        self.transitionToRoute('learnergroup', group);
      });

    }
  }
});
