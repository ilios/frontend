import Component from '@ember/component';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all, Promise as RSVPPromise } from 'rsvp';

export default Component.extend({
  router: service(),
  store: service(),

  isSaving: false,
  classNames: ['publish-all-sessions'],
  sessions: null,
  sessionsToOverride: null,
  publishableCollapsed: true,
  unPublishableCollapsed: true,
  totalSessionsToSave: null,
  currentSessionsSaved: null,

  noSessionsAsIs: equal('sessionsToOverride.length', 0),
  /**
   * @property allSessionsAsIs
   * @type {Ember.computed}
   * @public
   */
  allSessionsAsIs: computed('sessionsToOverride.[]', 'overridableSessions.[]', async function(){
    const overridableSessions = await this.get('overridableSessions');
    return (this.get('sessionsToOverride').get('length') === overridableSessions.length);
  }),

  /**
   * @property publishableSessions
   * @type {Ember.computed}
   * @public
   */
  publishableSessions: computed('sessions.@each.allPublicationIssuesLength', async function(){
    const sessions = await this.get('sessions');
    return sessions.filter(session => {
      return (session.get('allPublicationIssuesLength') === 0);
    });
  }),

  /**
   * @property unPublishableSessions
   * @type {Ember.computed}
   * @public
   */
  unPublishableSessions: computed('sessions.@each.requiredPublicationIssues', async function(){
    const sessions = await this.get('sessions');
    return sessions.filter(session => {
      return (session.get('requiredPublicationIssues').get('length') > 0);
    });
  }),

  /**
   * @property overridableSessions
   * @type {Ember.computed}
   * @public
   */
  overridableSessions: computed('sessions.@each.{requiredPublicationIssues,optionalPublicationIssues}', function(){
    return new RSVPPromise(resolve => {
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
    return new RSVPPromise(resolve => {
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
    return new RSVPPromise(resolve => {
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
    return new RSVPPromise(resolve => {
      this.get('unPublishableSessions').then(unPublishableSessions => {
        resolve(unPublishableSessions.length);
      });
    });
  }),

  course: computed('sessions', async function() {
    return await this.sessions.firstObject.course;
  }),

  showWarning: computed('course', async function() {
    const course = await this.course;
    const objectives = await course.objectives;
    return objectives.any((objective) => isEmpty(objective.parents));
  }),

  init(){
    this._super(...arguments);
    this.set('sessionsToOverride', []);
  },
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
        new RSVPPromise(resolve => {
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
        new RSVPPromise(resolve => {
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
              this.saved();
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
    },

    async transitionToCourse() {
      const course = await this.course;
      const queryParams = { courseObjectiveDetails: true, details: true };
      this.router.transitionTo('course', course, { queryParams });
    },

    async transitionToVisualizeObjectives() {
      const course = await this.course;
      this.router.transitionTo('course-visualize-objectives', course);
    },

    transitionToSession(session) {
      const queryParams = { sessionObjectiveDetails: true };
      this.router.transitionTo('session', session, { queryParams });
    }
  }
});
