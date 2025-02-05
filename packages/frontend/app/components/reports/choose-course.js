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

  get visibleYears() {
    let lastTenAndNextTenYears = [];
    for (let i = DateTime.now().year - 10; i <= DateTime.now().year + 10; i++) {
      lastTenAndNextTenYears.push(i);
    }
    if (this.showAllYears) {
      return lastTenAndNextTenYears;
    }

    return lastTenAndNextTenYears.slice(8, 11);
  }

  get visibleExapndedSchoolYears() {
    return this.selectedSchool?.years.filter(({ year }) => this.visibleYears.includes(year));
  }

  get filteredSchools() {
    return this.args.schools.filter(({ years }) => {
      const schoolYears = years.map(({ year }) => year);
      return schoolYears.some((year) => this.visibleYears.includes(year));
    });
  }

  toggleYear = (year) => {
    if (this.expandedYear === year) {
      this.expandedYear = null;
    } else {
      this.expandedYear = year;
    }
  };
}
