import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class DashboardCalendarFiltersComponent extends Component {
  @service dataLoader;

  courseLevels = ['1', '2', '3', '4', '5'];

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.loadSessionTypes(this.args.school));
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get sessionTypesLoaded() {
    return this.sessionTypesData.isResolved;
  }

  @cached
  get vocabulariesData() {
    return new TrackedAsyncData(this.loadVocabularies(this.args.school));
  }

  get vocabularies() {
    return this.vocabulariesData.isResolved ? this.vocabulariesData.value : [];
  }

  get vocabulariesLoaded() {
    return this.vocabulariesData.isResolved;
  }

  async loadSessionTypes(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const types = await school.sessionTypes;
    return sortBy(types, 'title');
  }

  async loadVocabularies(school) {
    await this.dataLoader.loadSchoolForCalendar(school.id);
    const vocabularies = await school.vocabularies;
    await Promise.all(mapBy(vocabularies, 'terms'));
    return sortBy(vocabularies, 'title');
  }
}

<div class="dashboard-calendar-filters" data-test-dashboard-calendar-filters>
  {{#if @courseFilters}}
    <Dashboard::CoursesCalendarFilter
      @school={{@school}}
      @add={{@addCourseId}}
      @remove={{@removeCourseId}}
      @selectedCourseIds={{@selectedCourseIds}}
    />
    <div
      id="calendar-sessiontypefilter"
      class="calendar-filter-list sessiontypefilter"
      data-test-session-type-filter
    >
      <h5>
        {{t "general.sessionTypes"}}
      </h5>
      <div class="filters">
        {{#if this.sessionTypesLoaded}}
          <ul>
            {{#each this.sessionTypes as |type|}}
              <li class="clickable">
                <Dashboard::FilterCheckbox
                  @checked={{includes type.id @selectedSessionTypeIds}}
                  @add={{fn @addSessionTypeId type.id}}
                  @remove={{fn @removeSessionTypeId type.id}}
                  @targetId={{type.id}}
                >
                  {{type.title}}
                </Dashboard::FilterCheckbox>
              </li>
            {{/each}}
          </ul>
        {{else}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
    <div class="calendar-filter-list vocabularyfilter" data-test-vocabulary-filter>
      <h5>
        {{t "general.terms"}}
      </h5>
      <div class="filters">
        {{#if this.vocabulariesLoaded}}
          <ul>
            {{#each this.vocabularies as |vocabulary|}}
              <Dashboard::SelectedVocabulary
                @selectedTermIds={{@selectedTermIds}}
                @vocabulary={{vocabulary}}
                @add={{@addTermId}}
                @remove={{@removeTermId}}
              />
            {{/each}}
          </ul>
        {{else}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
  {{else}}
    <div
      id="calendar-sessiontypefilter"
      class="calendar-filter-list sessiontypefilter"
      data-test-session-type-filter
    >
      <h5>
        {{t "general.sessionTypes"}}
      </h5>
      <div class="filters">
        {{#if this.sessionTypesLoaded}}
          <ul>
            {{#each this.sessionTypes as |type|}}
              <li class="clickable" data-test-filter>
                <Dashboard::FilterCheckbox
                  @checked={{includes type.id @selectedSessionTypeIds}}
                  @add={{fn @addSessionTypeId type.id}}
                  @remove={{fn @removeSessionTypeId type.id}}
                  @targetId={{type.id}}
                >
                  {{type.title}}
                </Dashboard::FilterCheckbox>
              </li>
            {{/each}}
          </ul>
        {{else}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
    <div
      id="calendar-courselevelfilter"
      class="calendar-filter-list courselevelfilter"
      data-test-course-level-filter
    >
      <h5>
        {{t "general.courseLevels"}}
      </h5>
      <div class="filters">
        <ul>
          {{#each this.courseLevels as |level|}}
            <li class="clickable">
              <Dashboard::FilterCheckbox
                @checked={{includes level @selectedCourseLevels}}
                @add={{fn @addCourseLevel level}}
                @remove={{fn @removeCourseLevel level}}
                @targetId={{level}}
              >
                {{level}}
              </Dashboard::FilterCheckbox>
            </li>
          {{/each}}
        </ul>
      </div>
    </div>
    <Dashboard::CohortCalendarFilter
      @cohortProxies={{@cohortProxies}}
      @add={{@addCohortId}}
      @remove={{@removeCohortId}}
      @selectedIds={{@selectedCohortIds}}
    />
  {{/if}}
</div>