import Component from '@glimmer/component';
import { service } from '@ember/service';
import { findBy, findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import GlobalSearchBox from 'frontend/components/global-search-box';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import CourseSearchResult from 'frontend/components/course-search-result';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import eq from 'ember-truth-helpers/helpers/eq';
import add from 'ember-math-helpers/helpers/add';
import gt from 'ember-truth-helpers/helpers/gt';
import { get, fn } from '@ember/helper';
import or from 'ember-truth-helpers/helpers/or';
import includes from 'ilios-common/helpers/includes';
import PaginationLinks from 'frontend/components/pagination-links';

export default class GlobalSearchComponent extends Component {
  @service iliosConfig;
  @service intl;
  @service('search') iliosSearch;
  @service store;

  size = 10;

  @cached
  get resultsData() {
    return new TrackedAsyncData(
      this.args.query ? this.iliosSearch.forCurriculum(this.args.query) : null,
    );
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get results() {
    if (this.resultsData.isResolved && this.resultsData.value) {
      return this.resultsData.value.courses;
    }

    return [];
  }

  get hasResults() {
    return Boolean(this.results.length);
  }

  get schools() {
    if (!this.schoolData.isResolved) {
      return [];
    }

    return this.schoolData.value;
  }

  get ignoredSchoolTitles() {
    if (!this.args.ignoredSchoolIds) {
      return [];
    }
    return this.args.ignoredSchoolIds.map((id) => {
      const school = findById(this.schools, id);
      return school ? school.title : '';
    });
  }

  get yearFilteredResults() {
    if (!this.args.selectedYear) {
      return this.results;
    }

    return this.results.filter((course) => course.year === Number(this.args.selectedYear));
  }

  get filteredResults() {
    return this.yearFilteredResults.filter(
      (course) => !this.ignoredSchoolTitles.includes(course.school),
    );
  }

  get paginatedResults() {
    return this.filteredResults.slice(
      this.args.page * this.size - this.size,
      this.args.page * this.size,
    );
  }

  get schoolOptions() {
    if (this.yearFilteredResults.length && this.schools.length) {
      const emptySchools = sortBy(
        this.schools.map(({ id, title }) => {
          return {
            id,
            title,
            results: 0,
          };
        }),
        'title',
      );
      const options = this.yearFilteredResults.reduce((set, course) => {
        const schoolOption = findBy(set, 'title', course.school);
        schoolOption.results++;

        return set;
      }, emptySchools);
      return options;
    }

    return [];
  }

  get yearOptions() {
    return uniqueValues(mapBy(this.results, 'year')).sort().reverse();
  }

  @action
  setSelectedYear(year) {
    this.args.setSelectedYear(year ? Number(year) : null);
    this.args.onSelectPage(1);
  }

  @action
  toggleSchoolSelection(id) {
    const ignoredSchoolIds = this.args.ignoredSchoolIds ? [...this.args.ignoredSchoolIds] : [];

    if (ignoredSchoolIds.includes(id)) {
      ignoredSchoolIds.splice(ignoredSchoolIds.indexOf(id), 1);
    } else {
      ignoredSchoolIds.push(id);
    }

    this.args.onSelectPage(1);
    this.args.setIgnoredSchoolIds(ignoredSchoolIds);
  }
  <template>
    <div class="global-search" data-test-global-search ...attributes>
      <GlobalSearchBox @query={{@query}} @search={{@setQuery}} />
      <ul
        class="results {{if (and this.resultsData.isPending (not this.hasResults)) 'hidden'}}"
        data-test-results
      >
        {{#if this.resultsData.isPending}}
          <li class="searching" data-test-searching>
            <FaIcon @icon="spinner" class="orange" @spin={{true}} />
            {{t "general.currentlySearchingPrompt"}}
          </li>
        {{else}}
          {{#each this.paginatedResults as |course|}}
            <CourseSearchResult @course={{course}} />
          {{else}}
            <li class="no-results">
              {{t "general.noSearchResultsPrompt"}}
            </li>
          {{/each}}
        {{/if}}
      </ul>
      {{#if this.hasResults}}
        <fieldset class="filters">
          <legend>
            {{t "general.showResultsFor"}}
          </legend>
          <div class="year-filters">
            <select
              aria-label={{t "general.year"}}
              data-test-academic-year-filter
              {{on "change" (pick "target.value" this.setSelectedYear)}}
            >
              <option selected={{eq null @selectedYear}} value>
                {{t "general.allAcademicYears"}}
              </option>
              {{#each this.yearOptions as |year|}}
                <option selected={{eq year @selectedYear}} value={{year}}>
                  {{year}}
                  -
                  {{add year 1}}
                </option>
              {{/each}}
            </select>
          </div>
          {{#if (gt (get this.schools "length") 1)}}
            <div class="school-filters" data-test-school-filters>
              {{#each this.schoolOptions as |obj index|}}
                <span class="filter" data-test-school-filter>
                  <input
                    id="school={{index}}"
                    type="checkbox"
                    checked={{or (eq obj.results 0) (not (includes obj.id @ignoredSchoolIds))}}
                    {{on "click" (fn this.toggleSchoolSelection obj.id)}}
                    disabled={{eq obj.results 0}}
                  />
                  <label for="school={{index}}">
                    {{obj.title}}
                    ({{obj.results}})
                  </label>
                </span>
              {{/each}}
            </div>
          {{/if}}
        </fieldset>
      {{/if}}
    </div>
    <PaginationLinks
      @page={{@page}}
      @results={{this.filteredResults}}
      @size={{this.size}}
      @onSelectPage={{@onSelectPage}}
    />
  </template>
}
