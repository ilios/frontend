import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { all } from 'rsvp';
import { dropTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { LinkTo } from '@ember/routing';
import { fn } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';
import mapBy from 'ilios-common/helpers/map-by';
import SaveButton from 'ilios-common/components/save-button';
import perform from 'ember-concurrency/helpers/perform';

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

  @cached
  get courseObjectivesData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get courseObjectives() {
    return this.courseObjectivesData.isResolved ? this.courseObjectivesData.value : null;
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
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
      sessionsToPublish.filter((s) => !this.userSelectedSessionsToSchedule.includes(s)),
    );
  }

  get sessionsToSchedule() {
    const sessionsToPublish = [...this.unpublishedSessions, ...this.userSelectedSessionsToSchedule];

    return uniqueValues(
      sessionsToPublish.filter((s) => !this.userSelectedSessionsToPublish.includes(s)),
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
      }),
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
        (s) => s !== session,
      );
      this.userSelectedSessionsToSchedule = [...this.userSelectedSessionsToSchedule, session];
    } else {
      this.userSelectedSessionsToSchedule = this.userSelectedSessionsToSchedule.filter(
        (s) => s !== session,
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
    this.flashMessages.success('general.savedSuccessfully', {
      capitalize: true,
    });
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
  <template>
    <div class="publish-all-sessions" data-test-publish-all-sessions>
      <section class="publish-all-sessions-unpublishable" data-test-unpublishable>
        <div>
          <button
            class="title link-button"
            type="button"
            aria-expanded={{if this.unPublishableCollapsed "true" "false"}}
            data-test-expand-collapse
            data-test-title
            {{on "click" (set this "unPublishableCollapsed" (not this.unPublishableCollapsed))}}
          >
            {{t "general.incompleteSessions"}}
            ({{this.unPublishableSessions.length}})
            <FaIcon @icon={{if this.unPublishableCollapsed "caret-right" "caret-down"}} />
          </button>
        </div>
        {{#unless this.unPublishableCollapsed}}
          <div class="content" data-test-content>
            <table>
              <thead>
                <tr>
                  <th>
                    {{t "general.sessionTitle"}}
                  </th>
                  <th>
                    {{t "general.offerings"}}
                  </th>
                  <th>
                    {{t "general.terms"}}
                  </th>
                  <th>
                    {{t "general.objectives"}}
                  </th>
                  <th>
                    {{t "general.meshTerms"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.unPublishableSessions as |session|}}
                  <tr>
                    <td data-test-title>
                      <LinkTo @route="session" @model={{session}}>
                        {{session.title}}
                      </LinkTo>
                    </td>
                    {{#if session.offerings.length}}
                      <td class="yes" data-test-offerings>
                        {{t "general.yes"}}
                        ({{session.offerings.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-offerings>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.terms.length}}
                      <td class="yes" data-test-terms>
                        {{t "general.yes"}}
                        ({{session.terms.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-terms>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.sessionObjectives.length}}
                      <td class="yes" data-test-objectives>
                        {{t "general.yes"}}
                        ({{session.sessionObjectives.length}})
                        {{#if session.showUnlinkIcon}}
                          <button
                            class="link-button"
                            type="button"
                            {{on "click" (fn this.transitionToSession session)}}
                            data-test-session-link
                          >
                            <FaIcon @icon="link-slash" />
                          </button>
                        {{/if}}
                      </td>
                    {{else}}
                      <td class="no" data-test-objectives>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.meshDescriptors.length}}
                      <td class="yes" data-test-mesh-descriptors>
                        {{t "general.yes"}}
                        ({{session.meshDescriptors.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-mesh-descriptors>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/unless}}
      </section>
      <section class="publish-all-sessions-publishable" data-test-publishable>
        <div>
          <button
            class="title link-button"
            type="button"
            aria-expanded={{if this.publishableCollapsed "true" "false"}}
            data-test-expand-collapse
            data-test-title
            {{on "click" (set this "publishableCollapsed" (not this.publishableCollapsed))}}
          >
            {{t "general.completeSessions"}}
            ({{this.publishableSessions.length}})
            <FaIcon @icon={{if this.publishableCollapsed "caret-right" "caret-down"}} />
          </button>
        </div>
        {{#unless this.publishableCollapsed}}
          <div class="content" data-test-content>
            <table>
              <thead>
                <tr>
                  <th>
                    {{t "general.sessionTitle"}}
                  </th>
                  <th>
                    {{t "general.offerings"}}
                  </th>
                  <th>
                    {{t "general.terms"}}
                  </th>
                  <th>
                    {{t "general.objectives"}}
                  </th>
                  <th>
                    {{t "general.meshTerms"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.publishableSessions as |session|}}
                  <tr>
                    <td data-test-title>
                      <LinkTo @route="session" @model={{session}}>
                        {{session.title}}
                      </LinkTo>
                    </td>
                    {{#if session.offerings.length}}
                      <td class="yes" data-test-offerings>
                        {{t "general.yes"}}
                        ({{session.offerings.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-offerings>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.terms.length}}
                      <td class="yes" data-test-terms>
                        {{t "general.yes"}}
                        ({{session.terms.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-terms>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.sessionObjectives.length}}
                      <td class="yes" data-test-objectives>
                        {{t "general.yes"}}
                        ({{session.sessionObjectives.length}})
                        {{#if session.showUnlinkIcon}}
                          <button
                            class="link-button"
                            type="button"
                            {{on "click" (fn this.transitionToSession session)}}
                            data-test-session-link
                          >
                            <FaIcon @icon="link-slash" />
                          </button>
                        {{/if}}
                      </td>
                    {{else}}
                      <td class="no" data-test-objectives>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.meshDescriptors.length}}
                      <td class="yes" data-test-mesh-descriptors>
                        {{t "general.yes"}}
                        ({{session.meshDescriptors.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-mesh-descriptors>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/unless}}
      </section>
      <section class="publish-all-sessions-overridable" data-test-overridable>
        <div class="title" data-test-title>
          {{t "general.reviewSessions"}}
          ({{this.overridableSessions.length}})
        </div>
        <div class="content">
          {{#if this.overridableSessions.length}}
            <button
              type="button"
              disabled={{this.allSessionsPublished}}
              {{on "click" this.publishAllAsIs}}
              data-test-publish-all-as-is
            >
              {{t "general.publishAsIs"}}
            </button>
            <button
              type="button"
              disabled={{this.allSessionsScheduled}}
              {{on "click" this.scheduleAll}}
              data-test-mark-all-as-scheduled
            >
              {{t "general.markAsScheduled"}}
            </button>
            <table>
              <thead>
                <tr>
                  <th>
                    {{t "general.actions"}}
                  </th>
                  <th>
                    {{t "general.sessionTitle"}}
                  </th>
                  <th>
                    {{t "general.offerings"}}
                  </th>
                  <th>
                    {{t "general.terms"}}
                  </th>
                  <th>
                    {{t "general.objectives"}}
                  </th>
                  <th>
                    {{t "general.meshTerms"}}
                  </th>
                </tr>
              </thead>
              <tbody>
                {{#each this.overridableSessions as |session|}}
                  <tr>
                    <td>
                      <ul>
                        <li>
                          <label>
                            <input
                              type="checkbox"
                              checked={{includes session.id (mapBy "id" this.sessionsToPublish)}}
                              {{on "click" (fn this.toggleSession session)}}
                              data-test-publish-as-is
                            />
                            {{t "general.publishAsIs"}}
                          </label>
                        </li>
                        <li>
                          <label>
                            <input
                              type="checkbox"
                              checked={{includes session.id (mapBy "id" this.sessionsToSchedule)}}
                              {{on "click" (fn this.toggleSession session)}}
                              data-test-mark-as-scheduled
                            />
                            {{t "general.markAsScheduled"}}
                          </label>
                        </li>
                      </ul>
                    </td>
                    <td data-test-title>
                      <LinkTo @route="session" @model={{session}}>
                        {{session.title}}
                      </LinkTo>
                    </td>
                    {{#if session.offerings.length}}
                      <td class="yes" data-test-offerings>
                        {{t "general.yes"}}
                        ({{session.offerings.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-offerings>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.terms.length}}
                      <td class="yes" data-test-terms>
                        {{t "general.yes"}}
                        ({{session.terms.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-terms>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.sessionOjectives.length}}
                      <td class="yes" data-test-objectives>
                        {{t "general.yes"}}
                        ({{session.sessionObjectives.length}})
                        {{#if session.showUnlinkIcon}}
                          <button
                            class="link-button"
                            type="button"
                            {{on "click" (fn this.transitionToSession session)}}
                            data-test-session-link
                          >
                            <FaIcon @icon="link-slash" />
                          </button>
                        {{/if}}
                      </td>
                    {{else}}
                      <td class="no" data-test-objectives>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                    {{#if session.meshDescriptors.length}}
                      <td class="yes" data-test-mesh-descriptors>
                        {{t "general.yes"}}
                        ({{session.meshDescriptors.length}})
                      </td>
                    {{else}}
                      <td class="no" data-test-mesh-descriptors>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                  </tr>
                {{/each}}
              </tbody>
            </table>
          {{/if}}
        </div>
      </section>
      <div class="publish-all-sessions-review" data-test-review>
        {{#if this.showWarning}}
          <span class="unlinked-warning" data-test-unlinked-warning>
            {{t "general.unlinkedObjectives"}}
          </span>
          <button
            class="link-button"
            type="button"
            {{on "click" this.transitionToCourse}}
            data-test-course-link
          >
            <FaIcon @icon="link-slash" />
          </button>
          <button
            class="link-button"
            type="button"
            {{on "click" this.transitionToVisualizeObjectives}}
            data-test-visualize
          >
            <FaIcon @icon="chart-column" />
          </button>
        {{/if}}
        <p data-test-confirmation>
          {{t
            "general.publishAllConfirmation"
            publishCount=this.publishCount
            scheduleCount=this.scheduleCount
            ignoreCount=this.ignoreCount
          }}
        </p>
        <SaveButton
          @isSaving={{this.save.isRunning}}
          @saveProgressPercent={{this.saveProgressPercent}}
          {{on "click" (perform this.save)}}
          data-test-save
        >
          {{t "general.go"}}
        </SaveButton>
      </div>
    </div>
  </template>
}
