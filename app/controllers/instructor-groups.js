import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  store: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter',
  },
  placeholderValueTranslation: 'instructorGroups.titleFilterPlaceholder',
  schoolId: null,
  titleFilter: null,
  schools: [],
  newInstructorGroups: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  filteredInstructorGroups: function(){
    var title = this.get('debouncedFilter');
    var exp = new RegExp(title, 'gi');
    return this.get('content').filter(function(instructorGroup) {
      let match = true;
      if(title != null && !instructorGroup.get('title').match(exp)){
        match = false;
      }

      return match;
    }).sortBy('title');
  }.property('debouncedFilter', 'content.@each'),
  actions: {
    editInstructorGroup: function(instructorGroup){
      this.transitionToRoute('instructorGroup', instructorGroup);
    },
    removeInstructorGroup: function(instructorGroup){
      this.get('content').removeObject(instructorGroup);
      instructorGroup.deleteRecord();
      instructorGroup.save();
    },
    addInstructorGroup: function(){
      var instructorGroup = this.get('store').createRecord('instructorGroup', {
        title: null,
        school: this.get('selectedSchool'),
      });
      this.get('newInstructorGroups').addObject(instructorGroup);
    },
    saveNewInstructorGroup: function(newInstructorGroup){
      var self = this;
      self.get('newInstructorGroups').removeObject(newInstructorGroup);
      newInstructorGroup.save().then(function(savedInstructorGroup){
        self.transitionToRoute('instructorGroup', savedInstructorGroup);
      });
    },
    removeNewInstructorGroup: function(newInstructorGroup){
      this.get('newInstructorGroups').removeObject(newInstructorGroup);
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
      this.set('selectedSchool', school);
    },
  },
});
