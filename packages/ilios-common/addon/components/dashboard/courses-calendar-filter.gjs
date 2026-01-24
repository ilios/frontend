import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, sortBy } from 'ilios-common/utils/array-helpers';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import includes from 'ilios-common/helpers/includes';
import inViewport from 'ember-in-viewport/modifiers/in-viewport';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import sortBy0 from 'ilios-common/helpers/sort-by';
import FilterCheckbox from 'ilios-common/components/dashboard/filter-checkbox';

export default class DashboardCoursesCalendarFilterComponent extends Component {
  @service dataLoader;
  @service iliosConfig;

  @tracked _expandedYears;
  @tracked yearsInView = [];
  @tracked titlesInView = [];

  scrollToDefaultExpandedYear = modifier((element, [year]) => {
    if (year === this.defaultExpandedYear) {
      const { offsetTop } = element;
      element.parentElement.scrollTo({
        top: offsetTop,
        behavior: 'instant',
      });
    }
  });

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  @cached
  get coursesRelationshipData() {
    return new TrackedAsyncData(this.args.school.courses);
  }

  get coursesRelationship() {
    if (!this.args.school) {
      return null;
    }

    return this.coursesRelationshipData.isResolved ? this.coursesRelationshipData.value : null;
  }

  get expandedYearWithoutTitleView() {
    const yearsWithNoTitle = this.yearsInView.filter((year) => !this.titlesInView.includes(year));
    const expandedYearsWithNoTitle = yearsWithNoTitle.filter((year) =>
      this.expandedYears.includes(year),
    );

    if (expandedYearsWithNoTitle.length) {
      return expandedYearsWithNoTitle[0];
    }

    return null;
  }

  get courses() {
    return this.coursesRelationship ? this.coursesRelationship : [];
  }

  get courseYears() {
    const courseYears = this.courses.reduce((acc, course) => {
      let year = acc.find(({ year }) => year === course.year);
      const label = this.academicYearCrossesCalendarYearBoundaries
        ? `${course.year} - ${course.year + 1}`
        : course.year.toString();
      if (!year) {
        year = {
          label,
          year: course.year,
          courses: [],
        };
        acc.push(year);
      }
      year.courses.push(course);

      return acc;
    }, []);

    return sortBy(courseYears, 'year').reverse();
  }

  get defaultExpandedYear() {
    if (this.courseYears.length) {
      const academicYear = currentAcademicYear();
      const coursesThisYear = findBy(this.courseYears, 'year', academicYear);
      return coursesThisYear ? academicYear : this.courseYears[0].year;
    }

    return false;
  }

  get expandedYears() {
    if (this._expandedYears !== undefined) {
      return this._expandedYears;
    }

    return this.defaultExpandedYear ? [this.defaultExpandedYear] : [];
  }

  @action
  toggleYear(year) {
    if (this.expandedYears.includes(year)) {
      this._expandedYears = this.expandedYears.filter((theYear) => theYear !== year);
    } else {
      this._expandedYears = [...this.expandedYears, year];
    }
  }

  @action
  addYearInView(year) {
    if (!this.yearsInView.includes(year)) {
      this.yearsInView = [...this.yearsInView, year];
    }
  }
  @action
  removeYearInView(year) {
    this.yearsInView = this.yearsInView.filter((theYear) => theYear !== year);
  }
  @action
  addTitleInView(title) {
    if (!this.titlesInView.includes(title)) {
      this.titlesInView = [...this.titlesInView, title];
    }
  }
  @action
  removeTitleInView(title) {
    this.titlesInView = this.titlesInView.filter((theTitle) => theTitle !== title);
  }
  <template>
    <div
      class="calendar-filter-list large-filter-list dashboard-courses-calendar-filter"
      data-test-courses-calendar-filter
    >
      <h2>
        {{t "general.courses"}}
        {{#if this.expandedYearWithoutTitleView}}
          {{#if this.academicYearCrossesCalendarYearBoundaries}}
            ({{this.expandedYearWithoutTitleView}}
            -
            {{add this.expandedYearWithoutTitleView 1}})
          {{else}}
            ({{this.expandedYearWithoutTitleView}})
          {{/if}}
        {{/if}}
      </h2>
      <div class="filters">
        {{#if this.coursesRelationshipData.isResolved}}
          {{#each this.courseYears as |year|}}
            <div
              class="year {{if (includes year.year this.expandedYears) 'expanded' 'collapsed'}}"
              {{this.scrollToDefaultExpandedYear year.year}}
              {{inViewport
                onEnter=(fn this.addYearInView year.year)
                onExit=(fn this.removeYearInView year.year)
                viewportSpy=true
              }}
              data-test-year
            >
              <h3
                class="year-title"
                data-test-year-title
                {{inViewport
                  onEnter=(fn this.addTitleInView year.year)
                  onExit=(fn this.removeTitleInView year.year)
                  viewportSpy=true
                }}
              >
                <button
                  type="button"
                  aria-expanded={{if (includes year.year this.expandedYears) "true" "false"}}
                  {{on "click" (fn this.toggleYear year.year)}}
                >
                  {{year.label}}
                  <FaIcon
                    @icon={{if (includes year.year this.expandedYears) "caret-down" "caret-right"}}
                  />
                </button>
              </h3>
              {{#if (includes year.year this.expandedYears)}}
                <ul class="courses">
                  {{#each (sortBy0 "title" year.courses) as |course|}}
                    <li data-test-course>
                      <FilterCheckbox
                        @checked={{includes course.id @selectedCourseIds}}
                        @add={{fn @add course.id}}
                        @remove={{fn @remove course.id}}
                        @targetId={{course.id}}
                      >
                        {{course.title}}
                        {{#if course.externalId}}
                          ({{course.externalId}})
                        {{/if}}
                      </FilterCheckbox>
                    </li>
                  {{/each}}
                </ul>
              {{/if}}
            </div>
          {{/each}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      </div>
    </div>
  </template>
}
