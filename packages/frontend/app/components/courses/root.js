import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

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
        `${course.title?.trim().toLowerCase()} (${course.externalId?.trim().toLowerCase()})`.includes(
          title,
        )
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
      defaultYear = this.args.years.slice().reverse()[0];
    }

    return defaultYear;
  }

  removeCourse = dropTask(async (course) => {
    const courses = await this.selectedSchool.courses;
    courses.splice(courses.indexOf(course), 1);
    this.selectedSchool.set('courses', courses);
    await course.destroyRecord();
    this.deletedCourse = course;
    if (this.newCourse === course) {
      this.newCourse = null;
    }
  });

  saveNewCourse = dropTask(async (newCourse) => {
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
}
