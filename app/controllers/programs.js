import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  currentUser: Ember.inject.service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter',
  },
  placeholderValueTranslation: 'programs.titleFilterPlaceholder',
  schoolId: null,
  titleFilter: null,
  schools: [],
  newPrograms: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  filteredPrograms: function(){
    var title = this.get('debouncedFilter');
    var exp = new RegExp(title, 'gi');
    return this.get('content').filter(function(course) {
      let match = true;
      if(title != null && !course.get('title').match(exp)){
        match = false;
      }

      return match;
    }).sortBy('title');
  }.property('debouncedFilter', 'content.@each'),
  actions: {
    editProgram: function(program){
      this.transitionToRoute('program', program);
    },
    removeProgram: function(program){
      this.get('content').removeObject(program);
      program.deleteRecord();
      program.save();
    },
    addProgram: function(){
      var program = this.store.createRecord('program', {
        title: null,
        owningSchool: this.get('selectedSchool'),
        duration: 4
      });
      this.get('newPrograms').addObject(program);
    },
    saveNewProgram: function(newProgram){
      var self = this;
      self.get('newPrograms').removeObject(newProgram);
      newProgram.save().then(function(savedProgram){
        self.transitionToRoute('program', savedProgram);
      });
    },
    removeNewProgram: function(newProgram){
      this.get('newPrograms').removeObject(newProgram);
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
      this.set('selectedSchool', school);
    },
  },
});
