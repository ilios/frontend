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
  proxiedSessions: Ember.computed('sessions.@each', function() {
    var sessions = this.get('sessions');
    if(sessions == null){
      return Ember.A();
    }
    return sessions.map(session => {
      return Ember.ObjectProxy.create({
        content: session,
        expandOfferings: false
      });
    });
  }),
  filteredContent: function(){
    var sessions = this.get('proxiedSessions');
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
  }.property('proxiedSessions.@each.searchString', 'debouncedFilter'),
  setSessionTypes: function(){
    var self = this;
    var course = this.get('course');
    if(course){
      course.get('owningSchool').then(function(owningSchool){
        if(owningSchool){
          owningSchool.get('sessionTypes').then(function(sessionTypes){
            self.set('sessionTypes', sessionTypes);
          });
        }
      });
    }
  }.observes('course', 'course.owningSchool', 'course.owningSchool.sessionTypes.@each').on('init'),
  actions: {
    addNewSession: function(){
      var sessionProxy = Ember.ObjectProxy.create({
        isSaved: false,
        content: this.get('store').createRecord('session')
      });

      this.get('newSessions').addObject(sessionProxy);
    },
    saveNewSession: function(newSession){
      let sessionProxy = this.get('newSessions').find(proxy => {
        return proxy.get('content') === newSession;
      });
      var course = this.get('course');
      newSession.set('course', course);
      newSession.save().then(savedSession => {
        course.get('sessions').addObject(savedSession);
        sessionProxy.set('content', savedSession);
        sessionProxy.set('isSaved', true);
      });
    },
    removeNewSession: function(newSession){
      let sessionProxy = this.get('newSessions').find(proxy => {
        return proxy.get('content') === newSession;
      });
      this.get('newSessions').removeObject(sessionProxy);
    },
    toggleExpandedOffering(sessionProxy){
      sessionProxy.set('expandOfferings', !sessionProxy.get('expandOfferings'));
    }
  }
});
