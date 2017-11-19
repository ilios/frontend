import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
const { equal } = computed;
const { all, Promise } = RSVP;

export default Component.extend({
  store: service(),
  isSaving: false,
  classNames: ['publish-all-sessions'],
  sessions: [],
  sessionsToOverride: [],
  noSessionsAsIs: equal('sessionsToOverride.length', 0),
  publishableCollapsed: true,
  unPublishableCollapsed: true,
  totalSessionsToSave: null,
  currentSessionsSaved: null,

  /**
   * @property allSessionsAsIs
   * @type {Ember.computed}
   * @public
   */
  allSessionsAsIs: computed('sessionsToOverride.[]', 'overridableSessions.[]', function(){
    return new Promise(resolve => {
      this.get('overridableSessions').then(overridableSessions => {
        resolve(this.get('sessionsToOverride').get('length') === overridableSessions.length);
      });
    });
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

  /**
   * @property publishCount
   * @type {Ember.computed}
   * @public
   */
  publishCount: computed('publishableSessions.[]','sessionsToOverride.length', function() {
    return new Promise(resolve => {
      this.get('publishableSessions').then(publishableSessions => {
        resolve(publishableSessions.length + parseInt(this.get('sessionsToOverride.length'), 10));
      });
    });
  }),

  /**
   * @property scheduleCount
   * @type {Ember.computed}
   * @public
   */
  scheduleCount: computed('overridableSessions.[]', 'sessionsToOverride.length', function() {
    return new Promise(resolve => {
      this.get('overridableSessions').then(overridableSessions => {
        resolve(overridableSessions.length - parseInt(this.get('sessionsToOverride.length'), 10));
      });
    });
  }),

  /**
   * @property ignoreCount
   * @type {Ember.computed}
   * @public
   */
  ignoreCount: computed('unPublishableSessions.[]', function() {
    return new Promise(resolve => {
      this.get('unPublishableSessions').then(unPublishableSessions => {
        resolve(unPublishableSessions.length);
      });
    });
  }),

  actions: {
    toggleSession(session){
      if(this.get('sessionsToOverride').includes(session)){
        this.get('sessionsToOverride').removeObject(session);
      } else{
        this.get('sessionsToOverride').pushObject(session);
      }
    },
    publishAllAsIs(){
      this.get('overridableSessions').then(overridableSessions => {
        overridableSessions.forEach(session => {
          if (!this.get('sessionsToOverride').includes(session)) {
            this.get('sessionsToOverride').pushObject(session);
          }
        });
      });
    },
    publishNoneAsIs(){
      this.get('overridableSessions').then(overridableSessions => {
        overridableSessions.forEach(session => {
          if(this.get('sessionsToOverride').includes(session)){
            this.get('sessionsToOverride').removeObject(session);
          }
        });
      });
    },
    save(){
      this.set('isSaving', true);
      let asIsSessions = this.get('sessionsToOverride');
      let sessionsToSave = [];
      let promises = [];

      promises.pushObject(
        new Promise(resolve => {
          this.get('overridableSessions').then(overridableSessions => {
            overridableSessions.forEach(session => {
              session.set('publishedAsTbd', !asIsSessions.includes(session));
              session.set('published', true);
              sessionsToSave.pushObject(session);
            });
            resolve();
          });
        })
      );

      promises.pushObject(
        new Promise(resolve => {
          this.get('publishableSessions').then(publishableSessions => {
            publishableSessions.forEach(session => {
              session.set('published', true);
              sessionsToSave.pushObject(session);
            });
            resolve();
          });
        })
      );

      all(promises).then(() => {
        this.set('totalSessionsToSave', sessionsToSave.length);
        this.set('currentSessionsSaved', 0);

        let saveSomeSessions = (sessions) => {
          let chunk = sessions.splice(0, 6);

          all(chunk.invoke('save')).then(() => {
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
      });
    },

    togglePublishableCollapsed(){
      this.set('publishableCollapsed', !this.get('publishableCollapsed'));
    },
    toggleUnPublishableCollapsed(){
      this.set('unPublishableCollapsed', !this.get('unPublishableCollapsed'));
    }
  }
});
