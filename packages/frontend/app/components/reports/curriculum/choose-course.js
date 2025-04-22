import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

export default class ReportsCurriculumChooseCourse extends Component {
  @service iliosConfig;
  @service currentUser;

  @tracked selectedSchoolId = null;
  @tracked expandedYear;

  constructor() {
    super(...arguments);
    this.expandedYear = currentAcademicYear();
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
    if (this.selectedSchoolId) {
      return this.selectedSchoolId;
    }
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
        isExpanded: year === this.expandedYear,
        year,
        courses,
        selectedCourses,
        hasSomeSelectedCourses,
        hasAllSelectedCourses,
      };
    });
  }

  updateChosenIds = (courseId, schoolId) => {
    if (this.args.selectedCourseIds.includes(courseId)) {
      this.args.remove(courseId, schoolId);
    } else {
      this.args.add(courseId, schoolId);
    }
  };

  toggleYear = (year) => {
    if (this.expandedYear === year) {
      this.expandedYear = null;
    } else {
      this.expandedYear = year;
    }
  };

  toggleAllCoursesInYear = (year) => {
    const schoolId = year.courses[0].school.id;
    if (year.hasAllSelectedCourses) {
      year.courses.forEach(({ id }) => this.args.remove(id, schoolId));
    } else {
      year.courses.forEach(({ id }) => this.args.add(id, schoolId));
    }
  };
}
