import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';
import FaIcon from 'ilios-common/components/fa-icon';
import gt from 'ember-truth-helpers/helpers/gt';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import sortBy from 'ilios-common/helpers/sort-by';
import { sortBy as uSortBy } from 'ilios-common/utils/array-helpers';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';

export default class ReportsCurriculumChooseCourse extends Component {
  @service iliosConfig;
  @service currentUser;

  @tracked selectedSchoolId = null;
  @tracked expandedYears = [];

  constructor() {
    super(...arguments);
    this.expandedYears.push(currentAcademicYear());
  }

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  get primarySchool() {
    return this.args.schools.find(({ id }) => id === this.user?.belongsTo('school').id());
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get bestSelectedSchoolId() {
    // if the user explicitly selected a school from the dropdown, then use that one.
    if (this.selectedSchoolId) {
      return this.selectedSchoolId;
    }

    // otherwise: if there were selected courses in the component input, then pick the first school by title
    // amongst the schools that these selected courses belong to.
    const schoolsWithSelectedCourses = this.args.schools.filter((school) => {
      return school.years.some((year) => {
        return year.courses.some((course) => this.args.selectedCourseIds.includes(course.id));
      });
    });
    if (schoolsWithSelectedCourses.length) {
      return uSortBy(schoolsWithSelectedCourses, 'title')[0].id;
    }

    // otherwise: pick the current user's primary school.
    return this.primarySchool?.id;
  }

  get selectedSchool() {
    return this.args.schools.find(({ id }) => id === this.bestSelectedSchoolId);
  }

  get filteredSchools() {
    return this.args.schools.filter(({ years }) => years.length);
  }

  get selectedSchoolYears() {
    return (this.selectedSchool?.years ?? []).map(({ year, courses }) => {
      const selectedCourses = courses.filter(({ id }) => this.args.selectedCourseIds.includes(id));
      const hasAllSelectedCourses = selectedCourses.length === courses.length;
      const hasSomeSelectedCourses = selectedCourses.length > 0 && !hasAllSelectedCourses;
      return {
        isExpanded: this.expandedYears.includes(year),
        year,
        courses,
        selectedCourses,
        hasSomeSelectedCourses,
        hasAllSelectedCourses,
      };
    });
  }

  toggleYear = (year, isExpanded) => {
    if (isExpanded) {
      this.expandedYears = this.expandedYears.filter((y) => y !== year);
    } else {
      this.expandedYears = [...this.expandedYears, year];
    }
  };

  toggleAllCoursesInYear = (year) => {
    if (year.hasAllSelectedCourses) {
      year.courses.forEach(({ id }) => this.args.remove(id));
    } else {
      year.courses.forEach(({ id }) => this.args.add(id));
    }
  };
  <template>
    <div class="reports-choose-course" data-test-reports-curriculum-choose-course>
      <div class="schools" data-test-schools>
        <FaIcon @icon="building-columns" />
        {{#if (gt this.filteredSchools.length 1)}}
          <select
            aria-label={{t "general.filterBySchool"}}
            {{on "change" (pick "target.value" (set this "selectedSchoolId"))}}
          >
            {{#each (sortBy "title" this.filteredSchools) as |school|}}
              <option value={{school.id}} selected={{eq school.id this.bestSelectedSchoolId}}>
                {{school.title}}
              </option>
            {{/each}}
          </select>
        {{else}}
          {{this.selectedSchool.title}}
        {{/if}}
        {{#if @selectedCourseIds.length}}
          <button
            type="button"
            aria-label={{t "general.deselectAllCourses"}}
            class="deselect-all"
            {{on "click" @removeAll}}
            data-test-deselect-all
          >
            {{t "general.deselectAllCourses"}}
          </button>
        {{/if}}
      </div>
      {{#each this.selectedSchoolYears as |y|}}
        <ul class="year {{if y.isExpanded 'expanded' 'collapsed'}}" data-test-year>
          <li>
            <input
              type="checkbox"
              checked={{y.hasAllSelectedCourses}}
              indeterminate={{y.hasSomeSelectedCourses}}
              {{on "click" (fn this.toggleAllCoursesInYear y)}}
              disabled={{eq y.courses.length 0}}
              aria-label={{t "general.selectAllOrNone"}}
              data-test-toggle-all
            />
            <button
              type="button"
              aria-expanded={{if y.isExpanded "true" "false"}}
              {{on "click" (fn this.toggleYear y.year y.isExpanded)}}
              data-test-expand
            >
              {{y.year}}
              <FaIcon @icon={{if y.isExpanded "caret-down" "caret-right"}} />
            </button>
            {{#if y.isExpanded}}
              <ul class="courses" data-test-courses>
                {{#each (sortBy "title" y.courses) as |c|}}
                  <li data-test-course>
                    <label>
                      <input
                        type="checkbox"
                        checked={{includes c.id @selectedCourseIds}}
                        {{on
                          "click"
                          (fn (if (includes c.id @selectedCourseIds) @remove @add) c.id)
                        }}
                      />
                      {{c.title}}
                      {{#if c.externalId}}
                        ({{c.externalId}})
                      {{/if}}
                    </label>
                  </li>
                {{/each}}
              </ul>
            {{/if}}
          </li>
        </ul>
      {{/each}}
    </div>
  </template>
}
