import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const {computed, inject, RSVP, isEmpty} = Ember;
const {PromiseArray} = DS;
const {service} = inject;

export default Ember.Component.extend({
  store: service(),
  i18n: service(),
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
  proxiedSessions: computed('course', 'course.sessions.[]', function() {
    let course = this.get('course');
    if(isEmpty(course)){
      return [];
    }
    let defer = RSVP.defer();
    course.get('sessions').then(sessions => {
      let proxiedSessions = sessions.map(session => {
        return Ember.ObjectProxy.create({
          content: session,
          expandOfferings: false
        });
      });
      
      defer.resolve(proxiedSessions);
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });
    
  }),
  filteredContent: computed('proxiedSessions.@each.searchString', 'debouncedFilter', function(){
    let defer = RSVP.defer();
    this.get('proxiedSessions').then(sessions => {
      let filter = this.get('debouncedFilter');
      let filterExpressions = filter.split(' ').map(function(string){
        return new RegExp(string, 'gi');
      });
      let filtered = sessions.filter(session => {
        let searchString = session.get('searchString');
        if(searchString === null || searchString === undefined){
          return false;
        }
        let matchedSearchTerms = 0;
        for (let i = 0; i < filterExpressions.length; i++) {
          if(searchString.match(filterExpressions[i])){
            matchedSearchTerms++;
          }
        }
        //if the number of matching search terms is equal to the number searched, return true
        return (matchedSearchTerms === filterExpressions.length);
      });
      
      defer.resolve(filtered.sortBy('title'));
    });
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    addNewSession(){
      this.get('course.school').then(school => {
        school.get('sessionTypes').then(sessionTypes => {
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
