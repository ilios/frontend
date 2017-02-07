import Ember from 'ember';

const { Component, computed, RSVP, inject } = Ember;
const { equal } = computed;
const { service } = inject;
const { Promise } = RSVP;

export default Component.extend({
  store: service(),
  isSaving: false,
  classNames: ['detail-view'],
  sessions: [],
  sessionsToOverride: [],
  noSessionsAsIs: equal('sessionsToOverride.length', 0),
  publishableCollapsed: true,
  unPublishableCollapsed: true,
  totalSessionsToSave: null,
  currentSessionsSaved: null,
  allSessionsAsIs: computed('sessionsToOverride.[]', 'overridableSessions.[]', function(){
    return this.get('sessionsToOverride').get('length') === this.get('overridableSessions').get('length');
  }),

  /**
   * @property publishableSessions
   * @type {Ember.computed}
   * @public
   */
  publishableSessions: computed('sessions.@each.allPublicationIssuesLength', function(){
    return new Promise(resolve => {
      this.get('sessions').then(sessions=>{
        let filteredSessions = sessions.filter(session => {
          return session.get('allPublicationIssuesLength') === 0;
        });
        resolve(filteredSessions);
      });
     });
  }),

  /**
   * @property unPublishableSessions
   * @type {Ember.computed}
   * @public
   */
  unPublishableSessions: computed('sessions.@each.requiredPublicationIssues', function(){
    return new Promise(resolve => {
      this.get('sessions').then(sessions=>{
        let filteredSessions = sessions.filter(session => {
          return session.get('requiredPublicationIssues').get('length') > 0;
        });
        resolve(filteredSessions);
      });
    });
  }),

  /**
   * @property overridableSessions
   * @type {Ember.computed}
   * @public
   */
  overridableSessions: computed('sessions.@each.{requiredPublicationIssues,optionalPublicationIssues}', function(){
    return new Promise(resolve => {
      this.get('sessions').then(sessions=>{
        let filteredSessions = sessions.filter(session => {
          return (
            session.get('requiredPublicationIssues').get('length') === 0 &&
            session.get('optionalPublicationIssues').get('length') > 0
          );
        });
        resolve(filteredSessions);
      });
    });
  }),

  publishCount: computed(
    'publishableSessions.length',
    'sessionsToOverride.length',
    function(){
      return parseInt(this.get('publishableSessions.length')) + parseInt(this.get('sessionsToOverride.length'));
    }
  ),
  scheduleCount: computed(
    'sessionsToOverride.length',
    'overridableSessions.length',
    function(){
      return parseInt(this.get('overridableSessions.length')) -
             parseInt(this.get('sessionsToOverride.length'));
    }
  ),
  ignoreCount: computed(
    'unPublishableSessions.length',
    function(){
      return parseInt(this.get('unPublishableSessions.length'));
    }
  ),

  actions: {
    toggleSession(session){
      if(this.get('sessionsToOverride').includes(session)){
        this.get('sessionsToOverride').removeObject(session);
      } else{
        this.get('sessionsToOverride').pushObject(session);
      }
    },
    publishAllAsIs(){
      this.get('overridableSessions').forEach(session =>{
        if(!this.get('sessionsToOverride').includes(session)){
          this.get('sessionsToOverride').pushObject(session);
        }
      });
    },
    publishNoneAsIs(){
      this.get('overridableSessions').forEach(session =>{
        if(this.get('sessionsToOverride').includes(session)){
          this.get('sessionsToOverride').removeObject(session);
        }
      });
    },
    save(){
      this.set('isSaving', true);
      let asIsSessions = this.get('sessionsToOverride');
      let sessionsToSave = [];
      this.get('overridableSessions').forEach(session =>{
        session.set('publishedAsTbd', !asIsSessions.includes(session));
        session.set('published', true);
        sessionsToSave.pushObject(session);
      });
      this.get('publishableSessions').forEach(session => {
        session.set('published', true);
        sessionsToSave.pushObject(session);
      });

      this.set('totalSessionsToSave', sessionsToSave.length);
      this.set('currentSessionsSaved', 0);
      this.set('isSaving', true);


      let saveSomeSessions = (sessions) => {
        let chunk = sessions.splice(0, 6);

        RSVP.all(chunk.invoke('save')).then(() => {
          if (sessions.length){
            this.set('currentSessionsSaved', this.get('currentSessionsSaved') + chunk.length);
            saveSomeSessions(sessions);
          } else {
            this.set('isSaving', false);
            this.sendAction('saved');
            this.get('flashMessages').success('general.savedSuccessfully');
          }
        });
      };

      saveSomeSessions(sessionsToSave);

    },
    togglePublishableCollapsed(){
      this.set('publishableCollapsed', !this.get('publishableCollapsed'));
    },
    toggleUnPublishableCollapsed(){
      this.set('unPublishableCollapsed', !this.get('unPublishableCollapsed'));
    }
  }
});
