import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { all } from 'rsvp';
import { dropTask, timeout } from 'ember-concurrency';
import ResolveAsyncValue from '../classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class PublishAllSessionsComponent extends Component {
  @service router;
  @service store;
  @service flashMessages;

  @tracked sessionsToNotOverride = [];
  @tracked publishableCollapsed = true;
  @tracked unPublishableCollapsed = true;
  @tracked totalSessionsToSave;
  @tracked currentSessionsSaved;

  @use courseObjectives = new ResolveAsyncValue(() => [this.args.course.courseObjectives]);

  get sessionsToOverride() {
    return this.overridableSessions.filter((session) => {
      return (
        !this.sessionsToNotOverride.includes(session) &&
        session.published &&
        !session.publishedAsTbd
      );
    });
  }

  get noSessionsAsIs() {
    return this.sessionsToOverride.length === 0;
  }

  get saveProgressPercent() {
    const total = this.totalSessionsToSave || 1;
    const current = this.currentSessionsSaved || 0;
    const floor = Math.floor((current / total) * 100);
    if (!floor && this.save.isRunning) {
      return 1;
    }

    return floor;
  }

  get showWarning() {
    if (!this.courseObjectives) {
      return false;
    }

    return this.courseObjectives.toArray().any((objective) => {
      return objective.programYearObjectives.length === 0;
    });
  }

  get allSessionsAsIs() {
    return this.sessionsToOverride.length === this.overridableSessions.length;
  }

  get publishableSessions() {
    if (!this.args.sessions) {
      return [];
    }
    return this.args.sessions.filter((session) => {
      return session.allPublicationIssuesLength === 0;
    });
  }

  get unPublishableSessions() {
    if (!this.args.sessions) {
      return [];
    }
    return this.args.sessions.filter((session) => {
      return session.requiredPublicationIssues.length > 0;
    });
  }

  get overridableSessions() {
    if (!this.args.sessions) {
      return [];
    }
    return this.args.sessions.filter((session) => {
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
  toggleSession(session) {
    if (this.sessionsToNotOverride.includes(session)) {
      this.sessionsToNotOverride = this.sessionsToNotOverride.filter(({ id }) => id !== session.id);
    } else {
      this.sessionsToNotOverride = [...this.sessionsToNotOverride, session];
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

  async saveSomeSessions(sessions) {
    const chunk = sessions.splice(0, 6);

    await all(chunk.invoke('save'));
    this.currentSessionsSaved += chunk.length;
    if (sessions.length) {
      await this.saveSomeSessions(sessions);
    }
  }

  @dropTask
  *save() {
    const sessionsToSave = [];

    this.overridableSessions.forEach((session) => {
      session.set('publishedAsTbd', !this.sessionsToOverride.includes(session));
      session.set('published', true);
      sessionsToSave.push(session);
    });

    this.publishableSessions.forEach((session) => {
      session.set('published', true);
      sessionsToSave.push(session);
    });
    this.totalSessionsToSave = sessionsToSave.length;
    this.currentSessionsSaved = 0;

    yield this.saveSomeSessions(sessionsToSave);
    this.flashMessages.success('general.savedSuccessfully');
    yield timeout(500);
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
