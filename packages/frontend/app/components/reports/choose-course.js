import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';

export default class ReportsChooseCourse extends Component {
  @service graphql;
  @service store;
  @service iliosConfig;
  @service currentUser;
  @service dataLoader;

  //tri state, null expands primary school, false collapses all, an id expands a specific school
  @tracked userExpandedSchoolId = null;
  @tracked expandedYear;
  @tracked showAllYears = false;

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
  get allSchools() {
    return this.store.peekAll('school');
  }

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  get primarySchool() {
    return this.allSchools.find(({ id }) => id === this.user?.belongsTo('school').id());
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get bestExpandedSchoolId() {
    if (this.userExpandedSchoolId) {
      return this.userExpandedSchoolId;
    }
    if (this.userExpandedSchoolId === null) {
      return this.primarySchool?.id;
    }

    return null;
  }

  @cached
  get expandedSchoolData() {
    return new TrackedAsyncData(
      this.bestExpandedSchoolId
        ? this.dataLoader.loadSchoolForCourses(this.bestExpandedSchoolId)
        : null,
    );
  }

  get expandedSchool() {
    return this.expandedSchoolData.isResolved ? this.expandedSchoolData.value : null;
  }

  get expandedSchoolCourses() {
    if (!this.expandedSchool) {
      return [];
    }

    const courseIds = this.expandedSchool.hasMany('courses').ids();
    return courseIds.map((id) => this.store.peekRecord('course', id));
  }

  get expandedSchoolYears() {
    const years = this.expandedSchoolCourses.map(({ year }) => year);
    return [...new Set(years)].sort().reverse();
  }

  get visibleExapndedSchoolYears() {
    if (this.showAllYears) {
      return this.expandedSchoolYears;
    }

    return this.expandedSchoolYears.slice(0, 3);
  }

  get coursesForExpandedSchoolAndYear() {
    return this.expandedSchoolCourses.filter(({ year }) => year === this.expandedYear);
  }

  toggleSchool = (schoolId) => {
    if (
      (this.userExpandedSchoolId === null && this.primarySchool?.id === schoolId) ||
      this.userExpandedSchoolId === schoolId
    ) {
      this.userExpandedSchoolId = false;
    } else {
      this.userExpandedSchoolId = schoolId;
    }
  };

  toggleYear = (year) => {
    if (this.expandedYear === year) {
      this.expandedYear = null;
    } else {
      this.expandedYear = year;
    }
  };
}
