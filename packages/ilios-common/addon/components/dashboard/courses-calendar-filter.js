import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';
import { TrackedAsyncData } from 'ember-async-data';
import { findBy, sortBy } from 'ilios-common/utils/array-helpers';
import currentAcademicYear from 'ilios-common/utils/current-academic-year';

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
  get schoolCalendarData() {
    return new TrackedAsyncData(this.dataLoader.loadSchoolForCalendar(this.args.school.id));
  }

  get schoolCalendar() {
    return this.schoolCalendarData.isResolved ? this.schoolCalendarData.value : null;
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
}
