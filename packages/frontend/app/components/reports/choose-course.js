import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';

export default class ReportsChooseCourse extends Component {
  @service iliosConfig;
  @service currentUser;

  @tracked selectedSchoolId = null;
  @tracked expandedYear;

  constructor() {
    super(...arguments);
    let { month, year } = DateTime.now();
    if (month < 7) {
      // before July 1st (start of a new academic year) show the year before
      year--;
    }
    this.expandedYear = year;
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

  get expandedYearCourseIds() {
    const year = this.selectedSchool?.years.find(({ year }) => year === this.expandedYear);
    return year?.courses.map(({ id }) => id) ?? [];
  }

  get hasSomeExpandedYearCourses() {
    return (
      this.args.selectedCourseIds &&
      !this.hasAllExpandedYearCourses &&
      this.expandedYearCourseIds.some((id) => this.args.selectedCourseIds.includes(id))
    );
  }

  get hasAllExpandedYearCourses() {
    return (
      this.args.selectedCourseIds &&
      this.expandedYearCourseIds.every((id) => this.args.selectedCourseIds.includes(id))
    );
  }

  toggleYear = (year) => {
    if (this.expandedYear === year) {
      this.expandedYear = null;
    } else {
      this.expandedYear = year;
    }
  };

  toggleAllExpandedYearCourseSelection = () => {
    if (this.hasAllExpandedYearCourses) {
      this.expandedYearCourseIds.forEach((id) => this.args.remove(id));
    } else {
      this.expandedYearCourseIds.forEach((id) => this.args.add(id));
    }
  };
}
