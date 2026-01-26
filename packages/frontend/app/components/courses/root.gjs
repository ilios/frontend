import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import New from 'frontend/components/courses/new';
import perform from 'ember-concurrency/helpers/perform';
import { LinkTo } from '@ember/routing';
import List from 'frontend/components/courses/list';
import LoadingList from 'frontend/components/courses/loading-list';

export default class CoursesRootComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service dataLoader;
  @service iliosConfig;
  @tracked deletedCourse = null;
  @tracked newCourse = null;
  @tracked showNewCourseForm = false;
  @tracked sortSchoolsBy = null;
  @tracked sortYearsBy = null;

  @cached
  get preloadedCoursesInSelectedSchoolData() {
    return new TrackedAsyncData(this.getCourses(this.selectedSchool, this.dataLoader));
  }

  get preloadedCoursesInSelectedSchool() {
    return this.preloadedCoursesInSelectedSchoolData.isResolved
      ? this.preloadedCoursesInSelectedSchoolData.value
      : false;
  }

  userModelData = new TrackedAsyncData(this.currentUser.getModel());
  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get coursesInSelectedSchoolData() {
    return new TrackedAsyncData(
      this.preloadedCoursesInSelectedSchool ? this.selectedSchool?.courses : [],
    );
  }

  get coursesInSelectedSchool() {
    return this.coursesInSelectedSchoolData.isResolved
      ? this.coursesInSelectedSchoolData.value
      : null;
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get userModel() {
    return this.userModelData.isResolved ? this.userModelData.value : null;
  }

  @cached
  get allRelatedCoursesData() {
    return new TrackedAsyncData(this.userModel?.allRelatedCourses);
  }

  get allRelatedCourses() {
    return this.allRelatedCoursesData.isResolved ? this.allRelatedCoursesData.value : null;
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.selectedSchool ? this.permissionChecker.canCreateCourse(this.selectedSchool) : false,
    );
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  get hasMoreThanOneSchool() {
    return this.args.schools.length > 1;
  }

  async getCourses(selectedSchool, dataLoader) {
    if (!selectedSchool) {
      return false;
    }

    await dataLoader.loadSchoolForCourses(selectedSchool.id);

    return true;
  }

  get coursesLoaded() {
    return this.preloadedCoursesInSelectedSchool;
  }

  get courses() {
    return this.coursesInSelectedSchool ?? [];
  }

  get coursesInSelectedYear() {
    const year = Number(this.selectedYear?.id);
    return this.courses.filter((course) => {
      return course.year === year && !course.archived;
    });
  }

  get coursesFilteredByTitle() {
    if (!this.args.titleFilter) {
      return this.coursesInSelectedYear;
    }
    const title = this.args.titleFilter.trim().toLowerCase() ?? '';
    return this.coursesInSelectedYear.filter((course) => {
      return (
        course.title?.trim().toLowerCase().includes(title) ||
        course.externalId?.trim().toLowerCase().includes(title) ||
        `${course.title?.trim().toLowerCase()} (${course.externalId
          ?.trim()
          .toLowerCase()})`.includes(title)
      );
    });
  }

  get filteredCourses() {
    if (this.args.userCoursesOnly) {
      return this.coursesFilteredByTitle.filter((course) =>
        this.allRelatedCourses?.includes(course),
      );
    }
    return this.coursesFilteredByTitle;
  }

  get selectedSchool() {
    if (this.args.schoolId) {
      const school = findById(this.args.schools, this.args.schoolId);
      if (school) {
        return school;
      }
    }

    return this.args.primarySchool;
  }

  get selectedYear() {
    if (this.args.year) {
      return this.args.years.find((year) => year.id === this.args.year);
    }
    const now = DateTime.now();
    let currentYear = now.year;
    const currentMonth = now.month;
    if (this.academicYearCrossesCalendarYearBoundaries && currentMonth < 6) {
      currentYear--;
    }
    let defaultYear = this.args.years.find((year) => Number(year.id) === currentYear);
    if (!defaultYear) {
      defaultYear = this.args.years.toReversed()[0];
    }

    return defaultYear;
  }

  @action
  changeSelectedSchool(school) {
    this.args.changeSelectedSchool(school);
    this.newCourse = null;
  }

  @action
  changeSelectedYear(year) {
    this.args.changeSelectedYear(year);
    this.newCourse = null;
  }

  removeCourse = task({ drop: true }, async (course) => {
    const courses = await this.selectedSchool.courses;
    courses.splice(courses.indexOf(course), 1);
    this.selectedSchool.set('courses', courses);
    await course.destroyRecord();
    this.deletedCourse = course;
    if (this.newCourse === course) {
      this.newCourse = null;
    }
  });

  saveNewCourse = task({ drop: true }, async (newCourse) => {
    newCourse.setDatesBasedOnYear();
    this.newCourse = await newCourse.save();
    this.showNewCourseForm = false;
  });

  @action
  lockCourse(course) {
    course.set('locked', true);
    return course.save();
  }

  @action
  unlockCourse(course) {
    course.set('locked', false);
    return course.save();
  }
  <template>
    <section class="courses-root main-section" data-test-courses-root>
      <div class="filters">
        <div class="toggle-mycourses" data-test-my-courses-filter>
          <ToggleButtons
            @firstOptionSelected={{@userCoursesOnly}}
            @firstLabel={{t "general.myCourses"}}
            @secondLabel={{t "general.allCourses"}}
            @toggle={{@toggleUserCoursesOnly}}
          />
        </div>
        <div class="schoolsfilter" data-test-school-filter>
          <FaIcon @icon="building-columns" @fixedWidth={{true}} />
          {{#if this.hasMoreThanOneSchool}}
            <select
              aria-label={{t "general.filterBySchool"}}
              {{on "change" (pick "target.value" this.changeSelectedSchool)}}
            >
              {{#each (sortBy "title" @schools) as |school|}}
                <option value={{school.id}} selected={{eq school this.selectedSchool}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          {{else}}
            {{this.selectedSchool.title}}
          {{/if}}
        </div>
        <div class="yearsfilter">
          <FaIcon @icon="calendar" @fixedWidth={{true}} />
          <select
            aria-label={{t "general.filterByYear"}}
            {{on "change" (pick "target.value" this.changeSelectedYear)}}
            data-test-year-filter
          >
            {{#each (sortBy "title:desc" @years) as |year|}}
              <option value={{year.id}} selected={{eq year this.selectedYear}}>
                {{year.title}}
              </option>
            {{/each}}
          </select>
        </div>
        <div class="titlefilter">
          <input
            value={{@titleFilter}}
            {{on "input" (pick "target.value" @changeTitleFilter)}}
            aria-label={{t "general.courseTitleFilterPlaceholder"}}
            placeholder={{t "general.courseTitleFilterPlaceholder"}}
            data-test-title-filter
          />
        </div>
      </div>
      <section class="courses">
        <div class="header">
          <h2 data-test-courses-header-title class="main-list-box-header-title">
            {{t "general.courses"}}
            ({{this.filteredCourses.length}})
          </h2>
          <div class="actions">
            {{#if this.canCreate}}
              <ExpandCollapseButton
                @value={{this.showNewCourseForm}}
                @action={{set this "showNewCourseForm" (not this.showNewCourseForm)}}
                @expandButtonLabel={{t "general.newCourse"}}
                @collapseButtonLabel={{t "general.close"}}
              />
            {{/if}}
          </div>
        </div>
        <section class="new">
          {{#if this.showNewCourseForm}}
            <New
              @currentSchool={{this.selectedSchool}}
              @currentYear={{this.selectedYear}}
              @save={{perform this.saveNewCourse}}
              @cancel={{set this "showNewCourseForm" false}}
            />
          {{/if}}
          {{#if this.newCourse}}
            <div class="saved-result" data-test-newly-saved-course>
              <LinkTo @route="course" @model={{this.newCourse}}>
                <FaIcon @icon="square-up-right" />
                {{this.newCourse.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </section>
        <div class="list">
          {{#if this.coursesLoaded}}
            <List
              @courses={{this.filteredCourses}}
              @query={{@titleFilter}}
              @sortBy={{@sortCoursesBy}}
              @lock={{this.lockCourse}}
              @remove={{perform this.removeCourse}}
              @setSortBy={{@setSortCoursesBy}}
              @unlock={{this.unlockCourse}}
            />
          {{else}}
            <LoadingList />
          {{/if}}
        </div>
      </section>
    </section>
  </template>
}
