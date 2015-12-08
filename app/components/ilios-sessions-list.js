import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { Component, computed, inject, isEmpty, observer, RSVP, run, ObjectProxy } = Ember;
const { PromiseArray, PromiseObject } = DS;
const { service } = inject;
const { debounce } = run;

const SessionProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  expandOfferings: false,
  showRemoveConfirmation: false,
  userCanDelete: computed('content.course', 'currentUser.model.directedCourses.[]', function(){
    let defer = RSVP.defer();
    this.get('currentUser.userIsDeveloper').then(isDeveloper => {
      if(isDeveloper){
        defer.resolve(true);
      } else {
        this.get('content').get('course').then(course => {
          this.get('currentUser.model').then(user => {
            user.get('directedCourses').then(directedCourses => {
              defer.resolve(directedCourses.contains(course));
            });
          });
        });
      }
    });
    
    return PromiseObject.create({
      promise: defer.promise
    });
  })
});

export default Component.extend({
  classNames: ['detail-view', 'sessions-list'],

  store: service(),
  i18n: service(),
  currentUser: service(),

  filter: '',
  course: null,

  placeholderValue: t('sessions.titleFilterPlaceholder'),

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: '',

  watchFilter: observer('filter', function() {
    debounce(this, this.setFilter, 500);
  }),

  setFilter() {
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
        return SessionProxy.create({
          content: session,
          currentUser: this.get('currentUser')
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

  editorOn: false,

  saved: false,
  savedSession: null,
  isSaving: null,

  actions: {
    toggleEditor() {
      if (this.get('editorOn')) {
        this.set('editorOn', false);
      } else {
        this.setProperties({ editorOn: true, saved: false });
      }
    },

    cancel() {
      this.set('editorOn', false);
    },

    save(title, sessionType) {
      const component = this;
      const store = this.get('store');
      const course = this.get('course');
      
      component.setProperties({ editorOn: false, isSaving: true, saved: false, savedSession: null });
      
      let newSession = store.createRecord('session', { title, sessionType, course });

      newSession.save().then((savedSession) => {
        course.get('sessions').then((sessions) => {
          sessions.addObject(savedSession);
          component.send('cancel');
          component.setProperties({ saved: true, savedSession: newSession, isSaving: false });
        });
      });
    },

    toggleExpandedOffering(sessionProxy){
      sessionProxy.set('expandOfferings', !sessionProxy.get('expandOfferings'));
    },
    confirmRemoval(sessionProxy){
      sessionProxy.set('showRemoveConfirmation', true);
    },
    remove(sessionProxy){
      let session = sessionProxy.get('content');
      session.deleteRecord();
      session.save();
    },
    cancelRemove(sessionProxy){
      sessionProxy.set('showRemoveConfirmation', false);
    }
  }
});
