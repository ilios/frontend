import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, inject, RSVP, ObjectProxy } = Ember;
const { PromiseArray, PromiseObject } = DS;
const { service } = inject;
const { sort, not, alias, collect } = computed;
const { Promise } = RSVP;

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
              defer.resolve(directedCourses.includes(course));
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

  editable: not('course.locked'),
  sessionsCount: alias('sessions.length'),
  sessions: alias('course.sessions'),
  offset: 0,
  limit: 25,

  filterBy: null,
  course: null,

  proxiedSessions: computed('sessions.[]', function() {
    return new Promise( resolve => {
      this.get('sessions').then(sessions => {
        return RSVP.map(sessions.toArray(), session => {
          return RSVP.hash({
            sessionType: session.get('sessionType'),
            firstOfferingDate: session.get('firstOfferingDate'),
            associatedLearnerGroups: session.get('associatedLearnerGroups'),
            offerings: session.hasMany('offerings').ids(),
          }).then(({sessionType, firstOfferingDate, associatedLearnerGroups, offerings})=> {
            return SessionProxy.create({
              content: session,
              currentUser: this.get('currentUser'),
              sessionType: sessionType.get('title'),
              firstOfferingDate,
              learnerGroupCount: associatedLearnerGroups.get('length'),
              offeringCount: offerings.get('length')
            });
          });
        }).then((proxiedSessions => {
          resolve(proxiedSessions);
        }));
      });
    });
  }),

  filteredContent: computed('proxiedSessions.[]', 'filterBy', function(){
    let defer = RSVP.defer();
    this.get('proxiedSessions').then(sessions => {
      let filter = this.get('filterBy');
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
  sortBy: 'title',
  sortSessionsBy: collect('sortBy'),
  sortedSessions: sort('filteredContent', 'sortSessionsBy'),
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  displayedSessions: computed('sortedSessions.[]', 'sortBy', 'offset', 'limit', function(){
    const limit = this.get('limit');
    const offset = this.get('offset');
    const end = limit + offset;
    let sessions = this.get('sortedSessions');

    return sessions.slice(offset, end);
  }),

  editorOn: false,

  saved: false,
  savedSession: null,
  isSaving: null,

  sessionTypes: computed('course.school.sessionTypes.[]', function(){
    return new Promise( resolve => {
      const course = this.get('course');
      course.get('school').then(school => {
        school.get('sessionTypes').then(sessionTypes => {
          resolve(sessionTypes);
        });
      });
    });
  }),

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

    save(session) {
      this.set('isSaving', true);
      const course = this.get('course');
      session.set('course', course);

      return session.save().then((savedSession) => {
        this.setProperties({ saved: true, savedSession, isSaving: false });
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
    },
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
