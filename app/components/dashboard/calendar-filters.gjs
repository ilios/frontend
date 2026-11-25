import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';

import includes from '../../helpers/includes';
import { mapBy, sortBy } from '../../utils/array-helpers';
import CohortCalendarFilter from './cohort-calendar-filter';
import CoursesCalendarFilter from './courses-calendar-filter';
import FilterCheckbox from './filter-checkbox';
import SessionTypesCalendarFilter from './sessiontypes-calendar-filter';
import TermsCalendarFilter from './terms-calendar-filter';

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
  <template>
    <div class="dashboard-calendar-filters" data-test-dashboard-calendar-filters>
      {{#if @courseFilters}}
        <CoursesCalendarFilter
          @school={{@school}}
          @add={{@addCourseId}}
          @remove={{@removeCourseId}}
          @selectedCourseIds={{@selectedCourseIds}}
        />
        <SessionTypesCalendarFilter
          @school={{@school}}
          @selectedIds={{@selectedSessionTypeIds}}
          @add={{@addSessionTypeId}}
          @remove={{@removeSessionTypeId}}
        />
        <TermsCalendarFilter
          @addTermId={{@addTermId}}
          @removeTermId={{@removeTermId}}
          @selectedTermIds={{@selectedTermIds}}
          @vocabularies={{this.vocabularies}}
        />
      {{else}}
        <SessionTypesCalendarFilter
          @school={{@school}}
          @selectedIds={{@selectedSessionTypeIds}}
          @add={{@addSessionTypeId}}
          @remove={{@removeSessionTypeId}}
        />
        <div
          id="calendar-courselevelfilter"
          class="calendar-filter-list courselevelfilter"
          data-test-course-level-filter
        >
          <h2>
            {{t "general.courseLevels"}}
          </h2>
          <div class="filters">
            <ul>
              {{#each this.courseLevels as |level|}}
                <li class="clickable">
                  <FilterCheckbox
                    @checked={{includes level @selectedCourseLevels}}
                    @add={{fn @addCourseLevel level}}
                    @remove={{fn @removeCourseLevel level}}
                    @targetId={{level}}
                  >
                    {{level}}
                  </FilterCheckbox>
                </li>
              {{/each}}
            </ul>
          </div>
        </div>
        <CohortCalendarFilter
          @cohortProxies={{@cohortProxies}}
          @add={{@addCohortId}}
          @remove={{@removeCohortId}}
          @selectedIds={{@selectedCohortIds}}
        />
      {{/if}}
    </div>
  </template>
}
