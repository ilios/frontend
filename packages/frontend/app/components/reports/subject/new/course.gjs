import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import t from 'ember-intl/helpers/t';
import load from 'ember-async-data/helpers/load';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import SearchInput from 'frontend/components/reports/subject/new/search/input';
import perform from 'ember-concurrency/helpers/perform';
import isArray from 'ember-truth-helpers/helpers/is-array';
import { fn } from '@ember/helper';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default class ReportsSubjectNewCourseComponent extends Component {
  @service store;
  @tracked courses;

  get loadCourse() {
    return this.store.findRecord('course', this.args.currentId);
  }

  get uniqueId() {
    return guidFor(this);
  }

  get filteredCourses() {
    if (!this.courses) {
      return [];
    }
    if (this.args.school) {
      const schoolId = Number(this.args.school.id);
      return this.courses.filter((c) => {
        return Number(c.belongsTo('school').id()) === schoolId;
      });
    }

    return this.courses;
  }

  get sortedCourses() {
    return this.filteredCourses.toSorted((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return a.title.localeCompare(b.title);
    });
  }

  search = task({ restartable: true }, async (q) => {
    if (!q.length) {
      this.courses = false;
      return;
    }

    this.courses = await this.store.query('course', {
      q,
    });
  });

  @action
  clear() {
    this.courses = false;
    this.args.changeId(null);
  }
  <template>
    <div class="new-subject-search" data-test-reports-subject-new-course>
      <p data-test-search>
        <label for="{{this.uniqueId}}-course-search">
          {{t "general.whichIs"}}
        </label>
        {{#if @currentId}}
          {{#let (load this.loadCourse) as |p|}}
            {{#if p.isResolved}}
              {{#let p.value as |course|}}
                <button
                  class="link-button"
                  type="button"
                  {{on "click" this.clear}}
                  data-test-selected-course
                >
                  {{course.year}}&nbsp;
                  {{#if course.externalId}}
                    [{{course.externalId}}]&nbsp;
                  {{/if}}
                  {{course.title}}
                  <FaIcon @icon={{faXmark}} class="remove" />
                </button>
              {{/let}}
            {{else}}
              <LoadingSpinner />
            {{/if}}
          {{/let}}
        {{else}}
          <SearchInput
            @search={{perform this.search}}
            @searchIsRunning={{this.search.isRunning}}
            @searchIsIdle={{this.search.isIdle}}
            @searchReturned={{isArray this.courses}}
            @results={{this.sortedCourses}}
            as |course|
          >
            <button class="link-button" type="button" {{on "click" (fn @changeId course.id)}}>
              {{course.year}}&nbsp;
              {{#if course.externalId}}
                [{{course.externalId}}]&nbsp;
              {{/if}}
              {{course.title}}
            </button>
          </SearchInput>
        {{/if}}
      </p>
    </div>
  </template>
}
