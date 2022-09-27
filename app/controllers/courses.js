import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { restartableTask, dropTask, timeout } from 'ember-concurrency';
import moment from 'moment';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import PermissionChecker from 'ilios/classes/permission-checker';
import { findById } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CoursesController extends Controller {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service dataLoader;
  @service iliosConfig;

  queryParams = [
    { schoolId: 'school' },
    { sortCoursesBy: 'sortBy' },
    { titleFilter: 'filter' },
    { year: 'year' },
    { userCoursesOnly: 'mycourses' },
  ];

  @tracked deletedCourse = null;
  @tracked newCourse = null;
  @tracked schoolId = null;
  @tracked showNewCourseForm = false;
  @tracked sortCoursesBy = 'title';
  @tracked sortSchoolsBy = null;
  @tracked sortYearsBy = null;
  @tracked titleFilter = null;
  @tracked userCoursesOnly = false;
  @tracked year = null;

  @use preloadedCoursesInSelectedSchool = new AsyncProcess(() => [
    this.getCourses,
    this.selectedSchool,
    this.dataLoader,
  ]);

  @use coursesInSelectedSchool = new ResolveAsyncValue(() => [
    this.preloadedCoursesInSelectedSchool ? this.selectedSchool?.courses : [],
  ]);

  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  ]);

  @use userModel = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use allRelatedCourses = new ResolveAsyncValue(() => [this.userModel?.allRelatedCourses]);
  @use canCreateCourse = new PermissionChecker(() => ['canCreateCourse', this.selectedSchool]);

  get hasMoreThanOneSchool() {
    return this.model.schools.length > 1;
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
    if (!this.titleFilter) {
      return this.coursesInSelectedYear;
    }
    const title = this.titleFilter.trim().toLowerCase() ?? '';
    return this.coursesInSelectedYear.filter((course) => {
      return (
        course.title?.trim().toLowerCase().includes(title) ||
        course.externalId?.trim().toLowerCase().includes(title)
      );
    });
  }

  get filteredCourses() {
    if (this.userCoursesOnly) {
      return this.coursesFilteredByTitle.filter((course) =>
        this.allRelatedCourses?.includes(course)
      );
    }
    return this.coursesFilteredByTitle;
  }

  get selectedSchool() {
    const { schools, primarySchool } = this.model;
    if (this.schoolId) {
      const school = findById(schools.slice(), this.schoolId);
      if (school) {
        return school;
      }
    }

    return primarySchool;
  }

  get selectedYear() {
    const { years } = this.model;
    if (this.year) {
      return years.find((year) => year.id === this.year);
    }
    let currentYear = Number(moment().format('YYYY'));
    const currentMonth = Number(moment().format('M'));
    if (this.academicYearCrossesCalendarYearBoundaries && currentMonth < 6) {
      currentYear--;
    }
    let defaultYear = years.find((year) => Number(year.id) === currentYear);
    if (!defaultYear) {
      defaultYear = years.slice().reverse()[0];
    }

    return defaultYear;
  }

  @dropTask
  *removeCourse(course) {
    const courses = (yield this.selectedSchool.courses).slice();
    courses.splice(courses.indexOf(course), 1);
    this.selectedSchool.set('courses', courses);
    yield course.destroyRecord();
    this.deletedCourse = course;
    if (this.newCourse === course) {
      this.newCourse = null;
    }
  }

  @dropTask
  *saveNewCourse(newCourse) {
    newCourse.setDatesBasedOnYear();
    this.newCourse = yield newCourse.save();
    this.showNewCourseForm = false;
  }

  @action
  changeSelectedYear(year) {
    this.set('year', year);
  }

  @action
  changeSelectedSchool(schoolId) {
    this.set('schoolId', schoolId);
  }

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

  @restartableTask
  *changeTitleFilter(value) {
    this.titleFilter = value;
    yield timeout(250);
    return value;
  }
}
