import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { on } from '@ember/modifier';
import { eq, or, not } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { LinkTo } from '@ember/routing';
import { fn, hash } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';
import mapBy from 'ilios-common/helpers/map-by';
import SaveButton from 'ilios-common/components/save-button';
import perform from 'ember-concurrency/helpers/perform';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import SortableTh from 'ilios-common/components/sortable-th';
import PublicationStatus from 'ilios-common/components/publication-status';
import { faLinkSlash, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class PublishAllSessionsComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;
  @service router;

  @tracked totalSessionsToSave;
  @tracked currentSessionsSaved;
  @tracked bulkSelectedAction = '';

  @tracked userSelectedSessionsToPublish = [];
  @tracked userSelectedSessionsToSchedule = [];

  @cached
  get courseObjectivesData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  get courseObjectives() {
    return this.courseObjectivesData.isResolved ? this.courseObjectivesData.value : null;
  }

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  get unpublishedSessions() {
    return this.overridableSessions.filter((s) => !this.publishedSessions.includes(s));
  }

  // sessions with no required, but possible optional, publication issues
  get publishableSessions() {
    return this.sessions.filter((session) => {
      return session.requiredPublicationIssues === 0;
    });
  }

  // Incomplete Sessions: cannot publish
  // - unpublished with required issues
  get unPublishableSessions() {
    return this.sessions.filter((session) => {
      return session.requiredPublicationIssues.length > 0;
    });
  }

  get sortedUnPublishableSessions() {
    if (this.args.sortIncompleteBy.includes('offerings')) {
      return this.unPublishableSessions.sort((a, b) => a.offerings.length - b.offerings.length);
    }

    if (this.args.sortIncompleteBy.includes('terms')) {
      return this.unPublishableSessions.sort((a, b) => a.terms.length - b.terms.length);
    }

    if (this.args.sortIncompleteBy.includes('objectives')) {
      return this.unPublishableSessions.sort(
        (a, b) => a.sessionObjectives.length - b.sessionObjectives.length,
      );
    }

    const locale = this.intl.get('primaryLocale');
    return this.unPublishableSessions.sort((a, b) => a.title.localeCompare(b.title, locale));
  }

  get sortedUnPublishableAscending() {
    return this.args.sortIncompleteBy.search(/desc/) === -1;
  }

  get orderedUnPublishableSessions() {
    return this.sortedUnPublishableAscending
      ? this.sortedUnPublishableSessions
      : this.sortedUnPublishableSessions.reverse();
  }

  // Published Sessions
  // - may be missing optional requirements
  // - not scheduled
  get publishedSessions() {
    return this.sessions.filter((s) => {
      return s.published && !s.publishedAsTbd;
    });
  }

  get sortedPublishedSessions() {
    if (this.args.sortCompleteBy.includes('offerings')) {
      return this.publishedSessions.sort((a, b) => a.offerings.length - b.offerings.length);
    }

    if (this.args.sortCompleteBy.includes('terms')) {
      return this.publishedSessions.sort((a, b) => a.terms.length - b.terms.length);
    }

    if (this.args.sortCompleteBy.includes('objectives')) {
      return this.publishedSessions.sort(
        (a, b) => a.sessionObjectives.length - b.sessionObjectives.length,
      );
    }

    const locale = this.intl.get('primaryLocale');
    return this.publishedSessions.sort((a, b) => a.title.localeCompare(b.title, locale));
  }

  get sortedPublishedAscending() {
    return this.args.sortCompleteBy.search(/desc/) === -1;
  }

  get orderedPublishedSessions() {
    return this.sortedPublishedAscending
      ? this.sortedPublishedSessions
      : this.sortedPublishedSessions.reverse();
  }

  // Unpublished Sessions: for review
  // - no required issues
  // - may be scheduled
  // can be reviewed for publishing or scheduling
  get overridableSessions() {
    return this.sessions.filter((session) => {
      return (
        (!session.published || session.publishedAsTbd) &&
        session.requiredPublicationIssues.length === 0
      );
    });
  }

  get sortedOverridableSessions() {
    if (this.args.sortUnpublishedBy.includes('offerings')) {
      return this.overridableSessions.sort((a, b) => a.offerings.length - b.offerings.length);
    }

    if (this.args.sortUnpublishedBy.includes('terms')) {
      return this.overridableSessions.sort((a, b) => a.terms.length - b.terms.length);
    }

    if (this.args.sortUnpublishedBy.includes('objectives')) {
      return this.overridableSessions.sort(
        (a, b) => a.sessionObjectives.length - b.sessionObjectives.length,
      );
    }

    const locale = this.intl.get('primaryLocale');
    return this.overridableSessions.sort((a, b) => a.title.localeCompare(b.title, locale));
  }

  get sortedOverridableAscending() {
    return this.args.sortUnpublishedBy.search(/desc/) === -1;
  }

  get orderedOverridableSessions() {
    return this.sortedOverridableAscending
      ? this.sortedOverridableSessions
      : this.sortedOverridableSessions.reverse();
  }

  get sessionsToPublish() {
    const sessionsToPublish = [...this.publishableSessions, ...this.userSelectedSessionsToPublish];

    return uniqueValues(
      sessionsToPublish.filter((s) => !this.userSelectedSessionsToSchedule.includes(s)),
    );
  }

  get sessionsToSchedule() {
    const sessionsToSchedule = [
      ...this.unpublishedSessions,
      ...this.userSelectedSessionsToSchedule,
    ];

    return uniqueValues(
      sessionsToSchedule.filter((s) => !this.userSelectedSessionsToPublish.includes(s)),
    );
  }

  get sessionsToAllBePublished() {
    return !this.sessionsToSchedule?.length;
  }

  get sessionsToAllBeScheduled() {
    return !this.sessionsToPublish?.length;
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

  get publishCount() {
    return this.sessionsToPublish.length;
  }

  get scheduleCount() {
    return this.sessionsToSchedule.length;
  }

  get ignoreCount() {
    return this.publishedSessions.length + this.unPublishableSessions.length;
  }

  get saveButtonText() {
    if (this.publishCount) {
      if (this.scheduleCount) {
        return this.intl.t('general.publishAndOrSchedule');
      } else {
        return this.intl.t('general.publish');
      }
    } else {
      if (this.scheduleCount) {
        return this.intl.t('general.schedule');
      }
    }

    return this.intl.t('general.publish');
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

    this.bulkSelectedAction = '';
  }

  @action
  publishAllAsIs() {
    this.userSelectedSessionsToSchedule = [];
    this.userSelectedSessionsToPublish = [...this.overridableSessions];
    this.bulkSelectedAction = 'publishAllAsIs';
  }

  @action
  scheduleAll() {
    this.userSelectedSessionsToPublish = [];
    this.userSelectedSessionsToSchedule = [...this.overridableSessions];
    this.bulkSelectedAction = 'scheduleAll';
  }

  @action
  setSortIncompleteBy(what) {
    if (this.args.sortIncompleteBy === what) {
      what += ':desc';
    }
    this.args.setSortIncompleteBy(what);
  }

  @action
  setSortCompleteBy(what) {
    if (this.args.sortCompleteBy === what) {
      what += ':desc';
    }
    this.args.setSortCompleteBy(what);
  }

  @action
  setSortUnpublishedBy(what) {
    if (this.args.sortUnpublishedBy === what) {
      what += ':desc';
    }
    this.args.setSortUnpublishedBy(what);
  }

  async saveSomeSessions(sessions) {
    const chunk = sessions.splice(0, 6);

    await Promise.all(chunk.map((o) => o.save()));
    this.currentSessionsSaved += chunk.length;
    if (sessions.length) {
      await this.saveSomeSessions(sessions);
    }
  }

  save = task({ drop: true }, async () => {
    const sessionsToSave = [];

    this.overridableSessions.forEach((session) => {
      session.set('publishedAsTbd', !this.sessionsToPublish.includes(session));
      session.set('published', true);
      sessionsToSave.push(session);
    });

    this.totalSessionsToSave = sessionsToSave.length;
    this.currentSessionsSaved = 0;

    await this.saveSomeSessions(sessionsToSave);
    this.flashMessages.success(this.intl.t('general.savedSuccessfully'), {
      capitalize: true,
    });
    await timeout(500);
    this.args.saved();
  });

  @action
  returnToCourse() {
    this.router.transitionTo('course', this.args.course);
  }

  <template>
    <div class="publish-all-sessions" {{scrollIntoView delay=10}} data-test-publish-all-sessions>
      <div class="publish-all-sessions-header" data-test-header>
        <span class="title" data-test-title>
          {{t "general.publicationReview"}}
        </span>
      </div>
      <section class="publish-all-sessions-unpublishable" data-test-unpublishable>
        <button
          class="title link-button"
          type="button"
          aria-expanded={{if @expandIncompleteSessions "true" "false"}}
          data-test-expand-collapse
          data-test-title
          {{on "click" (fn @setExpandIncompleteSessions (not @expandIncompleteSessions))}}
        >
          {{t "general.incompleteSessions"}}
          ({{this.unPublishableSessions.length}})
          <FaIcon @icon={{if @expandIncompleteSessions faCaretDown faCaretRight}} />
        </button>

        {{#if @expandIncompleteSessions}}
          <div class="content" data-test-content>
            <table class="ilios-table ilios-table-colors sticky-header">
              <thead>
                <tr>
                  <SortableTh
                    @colspan={{2}}
                    @sortedAscending={{this.sortedUnPublishableAscending}}
                    @onClick={{fn this.setSortIncompleteBy "title"}}
                    @sortedBy={{or
                      (eq @sortIncompleteBy "title")
                      (eq @sortIncompleteBy "title:desc")
                    }}
                  >
                    {{t "general.sessionTitle"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedUnPublishableAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortIncompleteBy "offerings"}}
                    @sortedBy={{or
                      (eq @sortIncompleteBy "offerings")
                      (eq @sortIncompleteBy "offerings:desc")
                    }}
                  >
                    {{t "general.offerings"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedUnPublishableAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortIncompleteBy "terms"}}
                    @sortedBy={{or
                      (eq @sortIncompleteBy "terms")
                      (eq @sortIncompleteBy "terms:desc")
                    }}
                  >
                    {{t "general.terms"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedUnPublishableAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortIncompleteBy "objectives"}}
                    @sortedBy={{or
                      (eq @sortIncompleteBy "objectives")
                      (eq @sortIncompleteBy "objectives:desc")
                    }}
                  >
                    {{t "general.objectives"}}
                  </SortableTh>
                </tr>
              </thead>
              <tbody>
                {{#each this.orderedUnPublishableSessions as |session|}}
                  <tr>
                    <td colspan="2" data-test-title>
                      <LinkTo @route="session" @model={{session}}>
                        {{session.title}}
                      </LinkTo>
                      <PublicationStatus @item={{session}} />
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
                          <LinkTo
                            @route="session"
                            @model={{session}}
                            @query={{hash sessionObjectiveDetails=true}}
                            title={{t "general.backToTitle" title=session.title}}
                            data-test-session-link
                          >
                            <FaIcon @icon={{faLinkSlash}} />
                          </LinkTo>
                        {{/if}}
                      </td>
                    {{else}}
                      <td class="no" data-test-objectives>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      </section>
      <section class="publish-all-sessions-published" data-test-published>
        <button
          class="title link-button"
          type="button"
          aria-expanded={{if @expandCompleteSessions "true" "false"}}
          data-test-expand-collapse
          data-test-title
          {{on "click" (fn @setExpandCompleteSessions (not @expandCompleteSessions))}}
        >
          {{t "general.publishedSessions"}}
          ({{this.publishedSessions.length}})
          <FaIcon @icon={{if @expandCompleteSessions faCaretDown faCaretRight}} />
        </button>

        {{#if @expandCompleteSessions}}
          <div class="content" data-test-content>
            <table class="ilios-table ilios-table-colors sticky-header">
              <thead>
                <tr>
                  <SortableTh
                    @colspan={{2}}
                    @sortedAscending={{this.sortedPublishedAscending}}
                    @onClick={{fn this.setSortCompleteBy "title"}}
                    @sortedBy={{or (eq @sortCompleteBy "title") (eq @sortCompleteBy "title:desc")}}
                  >
                    {{t "general.sessionTitle"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedPublishedAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortCompleteBy "offerings"}}
                    @sortedBy={{or
                      (eq @sortCompleteBy "offerings")
                      (eq @sortCompleteBy "offerings:desc")
                    }}
                  >
                    {{t "general.offerings"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedPublishedAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortCompleteBy "terms"}}
                    @sortedBy={{or (eq @sortCompleteBy "terms") (eq @sortCompleteBy "terms:desc")}}
                  >
                    {{t "general.terms"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedPublishedAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortCompleteBy "objectives"}}
                    @sortedBy={{or
                      (eq @sortCompleteBy "objectives")
                      (eq @sortCompleteBy "objectives:desc")
                    }}
                  >
                    {{t "general.objectives"}}
                  </SortableTh>
                </tr>
              </thead>
              <tbody>
                {{#each this.orderedPublishedSessions as |session|}}
                  <tr>
                    <td colspan="2" data-test-title>
                      <LinkTo @route="session" @model={{session}}>
                        {{session.title}}
                      </LinkTo>
                      <PublicationStatus @item={{session}} />
                    </td>
                    {{#if session.isIndependentLearning}}
                      <td data-test-offerings>
                        {{t "general.notApplicableAbbr"}}
                      </td>
                    {{else}}
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
                          <LinkTo
                            @route="session"
                            @model={{session}}
                            @query={{hash sessionObjectiveDetails=true}}
                            title={{t "general.backToTitle" title=session.title}}
                            data-test-session-link
                          >
                            <FaIcon @icon={{faLinkSlash}} />
                          </LinkTo>
                        {{/if}}
                      </td>
                    {{else}}
                      <td class="no" data-test-objectives>
                        {{t "general.no"}}
                      </td>
                    {{/if}}
                  </tr>
                {{/each}}
              </tbody>
            </table>
          </div>
        {{/if}}
      </section>
      <section class="publish-all-sessions-overridable" data-test-overridable>
        <div class="title" data-test-title>
          {{t "general.unPublishedSessions"}}
          ({{this.overridableSessions.length}})
        </div>
        <div class="content">
          {{#if this.overridableSessions.length}}
            <fieldset data-test-bulk-selection-actions>
              <label class="publish-all-as-is">
                <input
                  type="radio"
                  name="bulk-selection-action"
                  checked={{or
                    (eq this.bulkSelectedAction "publishAllAsIs")
                    this.sessionsToAllBePublished
                  }}
                  {{on "click" this.publishAllAsIs}}
                  data-test-publish-all-as-is
                />
                {{t "general.publishAllAsIs"}}
              </label>
              <label class="mark-all-as-scheduled">
                <input
                  type="radio"
                  name="bulk-selection-action"
                  checked={{or
                    (eq this.bulkSelectedAction "scheduleAll")
                    this.sessionsToAllBeScheduled
                  }}
                  {{on "click" this.scheduleAll}}
                  data-test-mark-all-as-scheduled
                />
                {{t "general.markAllAsScheduled"}}
              </label>
            </fieldset>

            <table class="ilios-table ilios-table-colors sticky-header">
              <thead>
                <tr>
                  <th>
                    {{t "general.actions"}}
                  </th>
                  <SortableTh
                    @colspan={{2}}
                    @sortedAscending={{this.sortedOverridableAscending}}
                    @onClick={{fn this.setSortUnpublishedBy "title"}}
                    @sortedBy={{or
                      (eq @sortUnpublishedBy "title")
                      (eq @sortUnpublishedBy "title:desc")
                    }}
                  >
                    {{t "general.sessionTitle"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedOverridableAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortUnpublishedBy "offerings"}}
                    @sortedBy={{or
                      (eq @sortUnpublishedBy "offerings")
                      (eq @sortUnpublishedBy "offerings:desc")
                    }}
                  >
                    {{t "general.offerings"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedOverridableAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortUnpublishedBy "terms"}}
                    @sortedBy={{or
                      (eq @sortUnpublishedBy "terms")
                      (eq @sortUnpublishedBy "terms:desc")
                    }}
                  >
                    {{t "general.terms"}}
                  </SortableTh>
                  <SortableTh
                    @sortedAscending={{this.sortedOverridableAscending}}
                    @sortType="numeric"
                    @onClick={{fn this.setSortUnpublishedBy "objectives"}}
                    @sortedBy={{or
                      (eq @sortUnpublishedBy "objectives")
                      (eq @sortUnpublishedBy "objectives:desc")
                    }}
                  >
                    {{t "general.objectives"}}
                  </SortableTh>
                </tr>
              </thead>
              <tbody>
                {{#each this.orderedOverridableSessions as |session|}}
                  <tr>
                    <td>
                      <fieldset data-test-session-action>
                        <label>
                          <input
                            type="radio"
                            name="session-action{{session.id}}"
                            checked={{includes session.id (mapBy "id" this.sessionsToPublish)}}
                            {{on "click" (fn this.toggleSession session)}}
                            data-test-publish-as-is
                          />
                          {{t "general.publishAsIs"}}
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="session-action{{session.id}}"
                            checked={{includes session.id (mapBy "id" this.sessionsToSchedule)}}
                            {{on "click" (fn this.toggleSession session)}}
                            data-test-mark-as-scheduled
                          />
                          {{t "general.markAsScheduled"}}
                        </label>
                      </fieldset>
                    </td>
                    <td colspan="2" data-test-title>
                      <LinkTo @route="session" @model={{session}}>
                        {{session.title}}
                      </LinkTo>
                      <PublicationStatus @item={{session}} />
                    </td>
                    {{#if session.isIndependentLearning}}
                      <td data-test-offerings>
                        {{t "general.notApplicableAbbr"}}
                      </td>
                    {{else}}
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
                          <LinkTo
                            @route="session"
                            @model={{session}}
                            @query={{hash sessionObjectiveDetails=true}}
                            title={{t "general.backToTitle" title=session.title}}
                            data-test-session-link
                          >
                            <FaIcon @icon={{faLinkSlash}} />
                          </LinkTo>
                        {{/if}}
                      </td>
                    {{else}}
                      <td class="no" data-test-objectives>
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
          <LinkTo
            @route="course"
            @model={{@course}}
            @query={{hash details=true courseObjectiveDetails=true}}
            title={{t "general.backToTitle" title=@course.title}}
            data-test-course-link
          >
            <FaIcon @icon={{faLinkSlash}} />
          </LinkTo>
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
          class="save"
          {{on "click" (perform this.save)}}
          data-test-save
        >
          {{this.saveButtonText}}
        </SaveButton>
        <button class="done text" type="button" {{on "click" this.returnToCourse}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  </template>
}
