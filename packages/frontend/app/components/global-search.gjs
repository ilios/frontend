import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import GlobalSearchBox from 'frontend/components/global-search-box';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import gt from 'ember-truth-helpers/helpers/gt';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import CourseSearchResult from 'frontend/components/course-search-result';
import { on } from '@ember/modifier';
import add from 'ember-math-helpers/helpers/add';
import { fn } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';
import PaginationLinks from 'frontend/components/pagination-links';
import { htmlSafe } from '@ember/template';
import { modifier } from 'ember-modifier';

const COURSES_PER_PAGE = 10;

export default class GlobalSearchComponent extends Component {
  @service iliosConfig;
  @service intl;
  @service('search') iliosSearch;
  @service store;
  @service dataLoader;

  @cached
  get resultsData() {
    return new TrackedAsyncData(
      this.args.query
        ? this.iliosSearch.forCurriculum(
            this.args.query,
            COURSES_PER_PAGE,
            this.from,
            this.args.selectedSchools,
            this.args.selectedYears,
          )
        : null,
    );
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  @cached
  get academicYearData() {
    return new TrackedAsyncData(this.dataLoader.loadAcademicYears());
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get visibleAcademicYears() {
    if (!this.academicYearData.isResolved) {
      return [];
    }

    return this.academicYearData.value
      .map((year) => Number(year.id))
      .sort()
      .reverse();
  }

  get from() {
    return (this.args.page - 1) * COURSES_PER_PAGE;
  }

  get results() {
    if (this.resultsData.isResolved && this.resultsData.value) {
      return this.resultsData.value.courses;
    }

    return [];
  }

  get didYouMeanResults() {
    if (this.resultsData.isResolved && this.resultsData.value) {
      return this.resultsData.value.didYouMean;
    }

    return [];
  }

  get totalResults() {
    if (this.resultsData.isResolved && this.resultsData.value) {
      //the PaginationLinks component expects an array of results, we get a number so fake that up into an array
      return Array.from(Array(this.resultsData.value.totalCourses).keys());
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

  toggleSchoolSelection = (id) => {
    if (this.args.selectedSchools.includes(id)) {
      this.args.setSchools(this.args.selectedSchools.filter((schoolId) => schoolId !== id));
    } else {
      this.args.setSchools([...this.args.selectedSchools, id]);
    }
  };

  toggleYearSelection = (year) => {
    if (this.args.selectedYears.includes(year)) {
      this.args.setYears(this.args.selectedYears.filter((y) => y !== year));
    } else {
      this.args.setYears([...this.args.selectedYears, year]);
    }
  };

  <template>
    <div class="global-search" data-test-global-search ...attributes>
      <GlobalSearchBox @query={{@query}} @search={{@setQuery}} />
      <DidYouMean
        @results={{this.didYouMeanResults}}
        @selectedSchools={{@selectedSchools}}
        @selectedYears={{@selectedYears}}
      />
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
          {{#each this.results as |course|}}
            <CourseSearchResult @course={{course}} />
          {{else}}
            <li class="no-results">
              {{t "general.noSearchResultsPrompt"}}
            </li>
          {{/each}}
        {{/if}}
      </ul>
      <fieldset class="filters">
        {{#if (gt this.schools.length 1)}}
          <h2>{{t "general.schools"}}</h2>
          <div class="school-filters" data-test-school-filters>
            {{#each this.schools as |school index|}}
              <span class="filter" data-test-school-filter>
                <input
                  id="school={{index}}"
                  type="checkbox"
                  checked={{includes school.id @selectedSchools}}
                  {{on "click" (fn this.toggleSchoolSelection school.id)}}
                />
                <label for="school={{index}}">
                  {{school.title}}
                </label>
              </span>
            {{/each}}
          </div>
        {{/if}}
        <h2>{{t "general.academicYears"}}</h2>
        <div class="year-filters" data-test-year-filters>
          {{#each this.visibleAcademicYears as |year index|}}
            <span class="filter" data-test-year-filter>
              <input
                id="year={{index}}"
                type="checkbox"
                checked={{includes year @selectedYears}}
                {{on "click" (fn this.toggleYearSelection year)}}
              />
              <label for="year={{index}}">
                {{#if this.academicYearCrossesCalendarYearBoundaries}}
                  {{year}}
                  -
                  {{add year 1}}
                {{else}}
                  {{year}}
                {{/if}}
              </label>
            </span>
          {{/each}}
        </div>
      </fieldset>
    </div>
    <PaginationLinks
      @page={{@page}}
      @results={{this.totalResults}}
      @size={{COURSES_PER_PAGE}}
      @onSelectPage={{@setPage}}
    />
  </template>
}

class DidYouMean extends Component {
  @service router;

  get shouldDisplay() {
    return this.args.results?.score > 0.03;
  }

  get highlightedSafe() {
    return htmlSafe(this.args.results.highlighted);
  }

  get href() {
    return this.router.urlFor('search', {
      queryParams: {
        q: this.args.results.didYouMean,
        schools: this.args.selectedSchools?.length ? this.args.selectedSchools.join('-') : null,
        years: this.args.selectedYears?.length ? this.args.selectedYears.join('-') : null,
      },
    });
  }

  /**
   * We can't reliable pass a link into a translation
   * without it causing a full page load when it is clicked.
   * As a fallback we find the link in the DOM and use the router to make the transition
   **/
  overrideLink = modifier((element) => {
    const link = element.querySelector('a');
    link.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        this.router.transitionTo('search', {
          queryParams: {
            q: this.args.results.didYouMean,
            schools: this.args.selectedSchools.length ? this.args.selectedSchools.join('-') : null,
            years: this.args.selectedYears.length ? this.args.selectedYears.join('-') : null,
          },
        });
      },
      { passive: false, once: true },
    );
  });

  <template>
    {{#if this.shouldDisplay}}
      <div class="did-you-mean" {{this.overrideLink}} data-test-did-you-mean>
        {{t "general.didYouMean" suggestion=this.highlightedSafe href=this.href htmlSafe=true}}
      </div>
    {{/if}}
  </template>
}
