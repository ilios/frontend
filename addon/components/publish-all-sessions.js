import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { all } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

export default class PublishAllSessionsComponent extends Component {
  @service router;
  @service store;
  @service flashMessages;

  @tracked sessionsToOverride = [];
  @tracked publishableCollapsed = true;
  @tracked unPublishableCollapsed = true;
  @tracked showWarning = false;
  @tracked totalSessionsToSave = [];
  @tracked currentSessionsSaved = [];

  get noSessionsAsIs() {
    return this.sessionsToOverride.length === 0;
  }

  @restartableTask
  *load() {
    const objectives = yield this.args.course.objectives;
    this.showWarning = objectives.any((objective) => !objective.parents.length);
  }

  get allSessionsAsIs(){
    return (this.sessionsToOverride.length === this.overridableSessions.length);
  }

  get publishableSessions(){
    return this.args.sessions.filter(session => {
      return (session.allPublicationIssuesLength === 0);
    });
  }

  get unPublishableSessions(){
    return this.args.sessions.filter(session => {
      return (session.requiredPublicationIssues.length > 0);
    });
  }

  get overridableSessions(){
    return this.args.sessions.filter(session => {
      return (
        session.requiredPublicationIssues.length === 0 &&
        session.optionalPublicationIssues.length > 0
      );
    });
  }

  get publishCount() {
    return this.publishableSessions.length + this.sessionsToOverride.length;
  }

  get scheduleCount() {
    return this.overridableSessions.length - this.sessionsToOverride.length;
  }

  get ignoreCount() {
    return this.unPublishableSessions.length;
  }

  @action
  toggleSession(session){
    if (this.sessionsToOverride.includes(session)) {
      this.sessionsToOverride = this.sessionsToOverride.filter(({ id }) => id !== session.id);
    } else{
      this.sessionsToOverride = [...this.sessionsToOverride, session];
    }
  }

  @action
  publishAllAsIs() {
    this.sessionsToOverride = [...this.sessionsToOverride, ...this.overridableSessions].uniq();
  }

  @action
  publishNoneAsIs() {
    this.sessionsToOverride = [];
  }

  async saveSomeSessions(sessions){
    const chunk = sessions.splice(0, 6);

    await all(chunk.invoke('save'));
    if (sessions.length) {
      this.currentSessionsSaved += chunk.length;
      await this.saveSomeSessions(sessions);
    }
  }

  @dropTask
  *save(){
    const sessionsToSave = [];

    this.overridableSessions.forEach(session => {
      session.set('publishedAsTbd', !this.sessionsToOverride.includes(session));
      session.set('published', true);
      sessionsToSave.push(session);
    });

    this.publishableSessions.forEach(session => {
      session.set('published', true);
      sessionsToSave.push(session);
    });
    this.totalSessionsToSave = sessionsToSave.length;
    this.currentSessionsSaved = 0;

    yield this.saveSomeSessions(sessionsToSave);
    this.flashMessages.success('general.savedSuccessfully');
    this.args.saved();
  }

  @action
  async transitionToCourse() {
    const queryParams = { courseObjectiveDetails: true, details: true };
    this.router.transitionTo('course', this.args.course, { queryParams });
  }

  @action
  async transitionToVisualizeObjectives() {
    this.router.transitionTo('course-visualize-objectives', this.args.course);
  }

  @action
  transitionToSession(session) {
    const queryParams = { sessionObjectiveDetails: true };
    this.router.transitionTo('session', session, { queryParams });
  }
}
