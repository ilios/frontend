import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy } from 'ilios-common/utils/array-helpers';
import animateLoading from 'ilios-common/modifiers/animate-loading';
import t from 'ember-intl/helpers/t';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import toggle from 'ilios-common/helpers/toggle';
import and from 'ember-truth-helpers/helpers/and';
import gt from 'ember-truth-helpers/helpers/gt';
import { LinkTo } from '@ember/routing';
import NewSession from 'ilios-common/components/new-session';
import perform from 'ember-concurrency/helpers/perform';
import set from 'ember-set-helper/helpers/set';
import { array, get, fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import { on } from '@ember/modifier';
import SessionsGridHeader from 'ilios-common/components/sessions-grid-header';
import eq from 'ember-truth-helpers/helpers/eq';
import SessionsGrid from 'ilios-common/components/sessions-grid';
import SessionsGridLoading from 'ilios-common/components/sessions-grid-loading';

const DEBOUNCE_DELAY = 250;

export default class CourseSessionsComponent extends Component {
  @service intl;
  @service permissionChecker;
  @service dataLoader;

  @tracked expandedSessionIds = [];
  @tracked filterByLocalCache = [];
  @tracked showNewSessionForm = false;

  @tracked tableHeadersLocked = true;

  @action
  setHeaderLockedStatus(isEditing) {
    this.tableHeadersLocked = !isEditing;
  }

  @cached
  get loadedCourseSessionsData() {
    return new TrackedAsyncData(this.dataLoader.loadCourseSessions(this.args.course.id));
  }

  @cached
  get sessionTypesData() {
    if (!this.school) {
      return null;
    }
    return new TrackedAsyncData(this.school.sessionTypes);
  }

  @cached
  get courseSessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.args.course.school);
  }

  get loadedCourseSessions() {
    return this.loadedCourseSessionsData.isResolved ? this.loadedCourseSessionsData.value : null;
  }

  get sessionTypes() {
    return this.sessionTypesData?.isResolved ? this.sessionTypesData.value : [];
  }

  get courseSessions() {
    return this.courseSessionsData.isResolved ? this.courseSessionsData.value : null;
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  get sessions() {
    if (!this.loadedCourseSessions) {
      return false;
    }

    return this.courseSessions;
  }

  get sessionsCount() {
    return this.args.course.hasMany('sessions').ids().length;
  }

  get showExpandAll() {
    return this.sessionsWithOfferings.length;
  }

  get sessionsWithOfferings() {
    if (!this.sessions) {
      return [];
    }
    return this.sessions.filter((session) => {
      const ids = session.hasMany('offerings').ids();
      return ids.length > 0;
    });
  }

  get filterByDebounced() {
    if (this.changeFilterBy.isIdle) {
      return this.args.filterBy;
    }

    return this.filterByLocalCache;
  }

  saveSession = task(async (session) => {
    session.set('course', this.args.course);

    return await session.save();
  });

  expandSession = task(async (session) => {
    await timeout(1);
    this.expandedSessionIds = [...this.expandedSessionIds, session.id];
  });

  closeSession = task(async (session) => {
    await timeout(1);
    this.expandedSessionIds = this.expandedSessionIds.filter((id) => id !== session.id);
  });

  changeFilterBy = restartableTask(async (event) => {
    const value = event.target.value;
    this.filterByLocalCache = value;
    await timeout(DEBOUNCE_DELAY);
    this.args.setFilterBy(value);
  });

  @action
  toggleExpandAll() {
    if (this.expandedSessionIds.length === this.sessionsWithOfferings.length) {
      this.expandedSessionIds = [];
    } else {
      this.expandedSessionIds = mapBy(this.sessionsWithOfferings, 'id');
    }
  }
  <template>
    <section
      class="course-sessions"
      {{animateLoading "course-sessions" loadingTime=500}}
      data-test-course-sessions
    >
      <div class="course-sessions-header" data-test-course-sessions-header>
        <div class="title" data-test-title>
          {{t "general.sessions"}}
          ({{this.sessionsCount}})
        </div>
        <div class="actions" data-test-actions>
          {{#if @canCreateSession}}
            <ExpandCollapseButton
              @value={{this.showNewSessionForm}}
              @action={{toggle "showNewSessionForm" this}}
            />
          {{/if}}
          {{#if (and @canUpdateCourse (gt this.sessionsCount 0))}}
            <LinkTo @route="course.publishall" @model={{@course}} data-test-publish-all>
              <button type="button">
                {{t "general.publishAllSessions" sessionCount=this.sessionsCount}}
              </button>
            </LinkTo>
          {{/if}}
        </div>
      </div>
      {{#if this.showNewSessionForm}}
        <div class="new-session-form">
          <NewSession
            @sessionTypes={{this.sessionTypes}}
            @save={{perform this.saveSession}}
            @cancel={{set this "showNewSessionForm" false}}
          />
        </div>
      {{/if}}
      {{#if this.saveSession.lastSuccessful.value}}
        <div class="save-result" data-test-new-saved-session>
          <LinkTo
            @route="session.index"
            @models={{array @course this.saveSession.lastSuccessful.value}}
          >
            <FaIcon @icon="square-up-right" />
            {{get this.saveSession.lastSuccessful.value "title"}}
          </LinkTo>
          {{t "general.savedSuccessfullyWithTitle"}}
        </div>
      {{/if}}

      {{#if this.sessionsCount}}
        <div class="filter">
          <input
            aria-label={{t "general.sessionTitleFilterPlaceholder"}}
            value={{this.filterByDebounced}}
            placeholder={{t "general.sessionTitleFilterPlaceholder"}}
            data-test-session-filter
            {{on "input" (fn (perform this.changeFilterBy))}}
          />
        </div>
        <section>
          <SessionsGridHeader
            @showExpandAll={{this.showExpandAll}}
            @setSortBy={{@setSortBy}}
            @sortBy={{@sortBy}}
            @allSessionsExpanded={{and
              (eq this.expandedSessionIds.length this.sessionsWithOfferings.length)
              (gt this.sessionsWithOfferings.length 0)
            }}
            @toggleExpandAll={{this.toggleExpandAll}}
            @headerIsLocked={{this.tableHeadersLocked}}
          />
          {{#if this.sessions}}
            <SessionsGrid
              @sessions={{this.sessions}}
              @sortBy={{@sortBy}}
              @filterBy={{@filterBy}}
              @expandedSessionIds={{this.expandedSessionIds}}
              @closeSession={{perform this.closeSession}}
              @expandSession={{perform this.expandSession}}
              @headerIsLocked={{this.tableHeadersLocked}}
              @setHeaderLockedStatus={{this.setHeaderLockedStatus}}
            />
          {{else}}
            <SessionsGridLoading @count={{this.sessionsCount}} />
          {{/if}}
        </section>
      {{/if}}
    </section>
  </template>
}
