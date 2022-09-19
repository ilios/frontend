import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { all } from 'rsvp';
import { dropTask, timeout } from 'ember-concurrency';
import ResolveAsyncValue from '../classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';
import { uniqueValues } from '../utils/array-helpers';

export default class PublishAllSessionsComponent extends Component {
  @service router;
  @service store;
  @service flashMessages;

  @tracked publishableCollapsed = true;
  @tracked unPublishableCollapsed = true;
  @tracked totalSessionsToSave;
  @tracked currentSessionsSaved;

  @tracked userSelectedSessionsToPublish = [];
  @tracked userSelectedSessionsToSchedule = [];

  @use courseObjectives = new ResolveAsyncValue(() => [this.args.course.courseObjectives]);

  get sessions() {
    return this.args.sessions ?? [];
  }

  get publishedSessions() {
    return this.overridableSessions.filter((s) => {
      return s.published && !s.publishedAsTbd;
    });
  }

  get unpublishedSessions() {
    return this.overridableSessions.filter((s) => !this.publishedSessions.includes(s));
  }

  get sessionsToPublish() {
    const sessionsToPublish = [...this.publishedSessions, ...this.userSelectedSessionsToPublish];

    return uniqueValues(
      sessionsToPublish.filter((s) => !this.userSelectedSessionsToSchedule.includes(s))
    );
  }

  get sessionsToSchedule() {
    const sessionsToPublish = [...this.unpublishedSessions, ...this.userSelectedSessionsToSchedule];

    return uniqueValues(
      sessionsToPublish.filter((s) => !this.userSelectedSessionsToPublish.includes(s))
    );
  }

  get allSessionsScheduled() {
    return this.sessionsToSchedule.length === this.overridableSessions.length;
  }

  get allSessionsPublished() {
    return this.sessionsToPublish.length === this.overridableSessions.length;
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

    return Boolean(
      this.courseObjectives.find((objective) => {
        return objective.programYearObjectives.length === 0;
      })
    );
  }

  get publishableSessions() {
    return this.sessions.filter((session) => {
      return session.allPublicationIssuesLength === 0;
    });
  }

  get unPublishableSessions() {
    return this.sessions.filter((session) => {
      return session.requiredPublicationIssues.length > 0;
    });
  }

  get overridableSessions() {
    return this.sessions.filter((session) => {
      return (
        session.requiredPublicationIssues.length === 0 &&
        session.optionalPublicationIssues.length > 0
      );
    });
  }

  get publishCount() {
    return this.publishableSessions.length + this.sessionsToPublish.length;
  }

  get scheduleCount() {
    return this.sessionsToSchedule.length;
  }

  get ignoreCount() {
    return this.unPublishableSessions.length;
  }

  @action
  toggleSession(session) {
    if (this.sessionsToPublish.includes(session)) {
      this.userSelectedSessionsToPublish = this.userSelectedSessionsToPublish.filter(
        (s) => s !== session
      );
      this.userSelectedSessionsToSchedule = [...this.userSelectedSessionsToSchedule, session];
    } else {
      this.userSelectedSessionsToSchedule = this.userSelectedSessionsToSchedule.filter(
        (s) => s !== session
      );
      this.userSelectedSessionsToPublish = [...this.userSelectedSessionsToPublish, session];
    }
  }

  @action
  publishAllAsIs() {
    this.userSelectedSessionsToSchedule = [];
    this.userSelectedSessionsToPublish = [...this.overridableSessions];
  }

  @action
  scheduleAll() {
    this.userSelectedSessionsToPublish = [];
    this.userSelectedSessionsToSchedule = [...this.overridableSessions];
  }

  async saveSomeSessions(sessions) {
    const chunk = sessions.splice(0, 6);

    await await all(chunk.map((o) => o.save()));
    this.currentSessionsSaved += chunk.length;
    if (sessions.length) {
      await this.saveSomeSessions(sessions);
    }
  }

  save = dropTask(async () => {
    const sessionsToSave = [];

    this.overridableSessions.forEach((session) => {
      session.set('publishedAsTbd', !this.sessionsToPublish.includes(session));
      session.set('published', true);
      sessionsToSave.push(session);
    });

    this.publishableSessions.forEach((session) => {
      session.set('published', true);
      sessionsToSave.push(session);
    });
    this.totalSessionsToSave = sessionsToSave.length;
    this.currentSessionsSaved = 0;

    await this.saveSomeSessions(sessionsToSave);
    this.flashMessages.success('general.savedSuccessfully');
    await timeout(500);
    this.args.saved();
  });

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
