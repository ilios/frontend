import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  filter: '',
  classNames: ['detail-view', 'sessions-list'],
  tagName: 'div',
  course: null,
  newSessions: [],
  placeholderValue: t('sessions.titleFilterPlaceholder'),
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: '',
  willInsertElement: function(){
    Ember.set(this, 'newSessions', []);
  },
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
  actions: {
    addNewSession(){
      this.get('course.owningSchool').then(owningSchool => {
        owningSchool.get('sessionTypes').then(sessionTypes => {
          //we attempt to load a type with the title of lecture as its the default
          let lectureType = sessionTypes.findBy('title', 'Lecture');
          let defaultType = lectureType?lectureType:sessionTypes.get('firstObject');
          let session = this.get('store').createRecord('session', {
            sessionType: defaultType
          });
          let sessionProxy = Ember.ObjectProxy.create({
            isSaved: false,
            content: session
          });

          this.get('newSessions').addObject(sessionProxy);
        });
      });
      
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
