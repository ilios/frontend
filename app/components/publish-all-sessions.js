/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
const { equal } = computed;
const { all, Promise } = RSVP;

export default Component.extend({
  store: service(),
  init(){
    this._super(...arguments);
    this.set('sessionsToOverride', []);
  },
  isSaving: false,
  classNames: ['publish-all-sessions'],
  sessions: null,
  sessionsToOverride: null,
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
      this.overridableSessions.then(overridableSessions => {
        resolve(this.sessionsToOverride.get('length') === overridableSessions.length);
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
      this.sessions.then(sessions=>{
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
      this.sessions.then(sessions=>{
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
      this.sessions.then(sessions=>{
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
      this.publishableSessions.then(publishableSessions => {
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
      this.overridableSessions.then(overridableSessions => {
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
      this.unPublishableSessions.then(unPublishableSessions => {
        resolve(unPublishableSessions.length);
      });
    });
  }),

  actions: {
    toggleSession(session){
      if(this.sessionsToOverride.includes(session)){
        this.sessionsToOverride.removeObject(session);
      } else{
        this.sessionsToOverride.pushObject(session);
      }
    },
    publishAllAsIs(){
      this.overridableSessions.then(overridableSessions => {
        overridableSessions.forEach(session => {
          if (!this.sessionsToOverride.includes(session)) {
            this.sessionsToOverride.pushObject(session);
          }
        });
      });
    },
    publishNoneAsIs(){
      this.overridableSessions.then(overridableSessions => {
        overridableSessions.forEach(session => {
          if(this.sessionsToOverride.includes(session)){
            this.sessionsToOverride.removeObject(session);
          }
        });
      });
    },
    save(){
      this.set('isSaving', true);
      let asIsSessions = this.sessionsToOverride;
      let sessionsToSave = [];
      let promises = [];

      promises.pushObject(
        new Promise(resolve => {
          this.overridableSessions.then(overridableSessions => {
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
          this.publishableSessions.then(publishableSessions => {
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
              this.set('currentSessionsSaved', this.currentSessionsSaved + chunk.length);
              saveSomeSessions(sessions);
            } else {
              this.set('isSaving', false);
              this.sendAction('saved');
              this.flashMessages.success('general.savedSuccessfully');
            }
          });
        };
        saveSomeSessions(sessionsToSave);
      });
    },

    togglePublishableCollapsed(){
      this.set('publishableCollapsed', !this.publishableCollapsed);
    },
    toggleUnPublishableCollapsed(){
      this.set('unPublishableCollapsed', !this.unPublishableCollapsed);
    }
  }
});
