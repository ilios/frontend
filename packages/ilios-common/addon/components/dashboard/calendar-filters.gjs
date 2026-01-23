import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import CoursesCalendarFilter from 'ilios-common/components/dashboard/courses-calendar-filter';
import t from 'ember-intl/helpers/t';
import FilterCheckbox from 'ilios-common/components/dashboard/filter-checkbox';
import includes from 'ilios-common/helpers/includes';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import CohortCalendarFilter from 'ilios-common/components/dashboard/cohort-calendar-filter';
import TermsCalendarFilter from 'ilios-common/components/dashboard/terms-calendar-filter';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

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
        <div
          id="calendar-sessiontypefilter"
          class="calendar-filter-list sessiontypefilter"
          data-test-session-type-filter
        >
          <h2>
            {{t "general.sessionTypes"}}
          </h2>
          <div class="filters">
            {{#if this.sessionTypesLoaded}}
              <ul>
                {{#each this.sessionTypes as |type|}}
                  <li class="clickable">
                    <FilterCheckbox
                      @checked={{includes type.id @selectedSessionTypeIds}}
                      @add={{fn @addSessionTypeId type.id}}
                      @remove={{fn @removeSessionTypeId type.id}}
                      @targetId={{type.id}}
                    >
                      {{type.title}}
                    </FilterCheckbox>
                  </li>
                {{/each}}
              </ul>
            {{else}}
              <FaIcon @icon={{faSpinner}} @spin={{true}} />
            {{/if}}
          </div>
        </div>
        <TermsCalendarFilter
          @addTermId={{@addTermId}}
          @removeTermId={{@removeTermId}}
          @selectedTermIds={{@selectedTermIds}}
          @vocabularies={{this.vocabularies}}
        />
      {{else}}
        <div
          id="calendar-sessiontypefilter"
          class="calendar-filter-list sessiontypefilter"
          data-test-session-type-filter
        >
          <h2>
            {{t "general.sessionTypes"}}
          </h2>
          <div class="filters">
            {{#if this.sessionTypesLoaded}}
              <ul>
                {{#each this.sessionTypes as |type|}}
                  <li class="clickable" data-test-filter>
                    <FilterCheckbox
                      @checked={{includes type.id @selectedSessionTypeIds}}
                      @add={{fn @addSessionTypeId type.id}}
                      @remove={{fn @removeSessionTypeId type.id}}
                      @targetId={{type.id}}
                    >
                      {{type.title}}
                    </FilterCheckbox>
                  </li>
                {{/each}}
              </ul>
            {{else}}
              <FaIcon @icon={{faSpinner}} @spin={{true}} />
            {{/if}}
          </div>
        </div>
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
