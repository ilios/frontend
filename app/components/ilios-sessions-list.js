import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  store: Ember.inject.service(),
  filter: '',
  classNames: ['detail-view', 'sessions-list'],
  tagName: 'div',
  course: null,
  newSessions: [],
  sessionTypes: [],
  placeholderValueTranslation: 'sessions.titleFilterPlaceholder',
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: '',
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('filter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('filter'));
  },
  filteredContent: function(){
    var sessions = this.get('sessions');
    if(sessions == null){
      return Ember.A();
    }
    var filter = this.get('debouncedFilter');
    var filterExpressions = filter.split(' ').map(function(string){
      return new RegExp(string, 'gi');
    });
    var filtered = sessions.filter(function(session) {
      var searchString = session.get('searchString');
      if(searchString === null || searchString === undefined){
        return false;
      }
      var matchedSearchTerms = 0;
      for (var i = 0; i < filterExpressions.length; i++) {
        if(searchString.match(filterExpressions[i])){
          matchedSearchTerms++;
        }
      }
      //if the number of matching search terms is equal to the number searched, return true
      return (matchedSearchTerms === filterExpressions.length);
    });
    return filtered.sortBy('title');
  }.property('sessions.@each.searchString', 'debouncedFilter'),
  setSessionTypes: function(){
    var self = this;
    var course = this.get('course');
    if(course){
      course.get('owningSchool').then(function(owningSchool){
        owningSchool.get('sessionTypes').then(function(sessionTypes){
          self.set('sessionTypes', sessionTypes);
        });
      });
    }
  }.observes('course', 'course.owningSchool', 'course.owningSchool.sessionTypes.@each').on('init'),
  actions: {
    addNewSession: function(){
      var session = this.get('store').createRecord('session');
      this.get('newSessions').addObject(session);
    },
    saveNewSession: function(newSession){
      var self = this;
      this.get('newSessions').removeObject(newSession);
      var course = this.get('course');
      newSession.set('course', course);
      newSession.save().then(function(savedSession){
        course.get('sessions').addObject(savedSession);
        self.sendAction('openSession', course, savedSession);
      });
    },
    removeNewSession: function(newSession){
      this.get('newSessions').removeObject(newSession);
    },
  }
});
