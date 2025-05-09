import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import load from 'ember-async-data/helpers/load';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import SearchInput from 'frontend/components/reports/subject/new/search/input';
import perform from 'ember-concurrency/helpers/perform';
import isArray from 'ember-truth-helpers/helpers/is-array';
import { fn } from '@ember/helper';

export default class ReportsSubjectNewSessionComponent extends Component {
  @service store;
  @tracked sessions;

  get uniqueId() {
    return guidFor(this);
  }

  get loadSession() {
    return this.store.findRecord('session', this.args.currentId);
  }

  get filteredSessions() {
    if (!this.sessions) {
      return [];
    }
    if (this.args.school) {
      const schoolId = Number(this.args.school.id);
      return this.sessions.filter((session) => {
        const courseId = session.belongsTo('course').id();
        const course = this.store.peekRecord('course', courseId);

        return Number(course.belongsTo('school').id()) === schoolId;
      });
    }

    return this.sessions;
  }

  get sortedSessions() {
    return this.filteredSessions.slice().sort((a, b) => {
      const courseA = this.store.peekRecord('course', a.belongsTo('course').id());
      const courseB = this.store.peekRecord('course', b.belongsTo('course').id());

      if (courseA.year !== courseB.year) {
        return courseB.year - courseA.year;
      }

      const courseTitleCompare = courseA.title.localeCompare(courseB.title);
      if (courseTitleCompare !== 0) {
        return courseTitleCompare;
      }

      return a.title.localeCompare(b.title);
    });
  }

  search = restartableTask(async (q) => {
    if (!q.length) {
      this.sessions = false;
      return;
    }

    this.sessions = await this.store.query('session', {
      q: q,
      include: 'course',
    });
  });

  @action
  clear() {
    this.sessions = false;
    this.args.changeId(null);
  }
  <template>
    <div class="new-subject-search" data-test-reports-subject-new-session>
      <p data-test-search>
        <label for="{{this.uniqueId}}-session-search">
          {{t "general.whichIs"}}
        </label>
        {{#if @currentId}}
          {{#let (load this.loadSession) as |p|}}
            {{#if p.isResolved}}
              {{#let p.value as |session|}}
                <button
                  class="link-button"
                  type="button"
                  {{on "click" this.clear}}
                  data-test-selected-session
                >
                  {{session.course.year}}
                  |&nbsp;
                  {{session.title}}
                  {{#if session.course.externalId}}
                    [{{session.course.externalId}}] |
                  {{/if}}
                  {{session.course.title}}
                  <FaIcon @icon="xmark" class="remove" />
                </button>
              {{/let}}
            {{else}}
              <LoadingSpinner />
            {{/if}}
          {{/let}}
        {{else}}
          <SearchInput
            id="{{this.uniqueId}}-session-search"
            @search={{perform this.search}}
            @searchIsRunning={{this.search.isRunning}}
            @searchIsIdle={{this.search.isIdle}}
            @searchReturned={{isArray this.sessions}}
            @results={{this.sortedSessions}}
            as |session|
          >
            <button class="link-button" type="button" {{on "click" (fn @changeId session.id)}}>
              {{session.course.year}}
              |&nbsp;
              {{session.title}}
              {{#if session.course.externalId}}
                [{{session.course.externalId}}] |
              {{/if}}
              {{session.course.title}}
            </button>

          </SearchInput>
        {{/if}}
      </p>
    </div>
  </template>
}
