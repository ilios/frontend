import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { findBy, sortBy } from 'ilios-common/utils/array-helpers';
import scrollIntoView from 'scroll-into-view';

export default class DashboardCoursesCalendarFilterComponent extends Component {
  @service dataLoader;
  @service iliosConfig;

  @tracked _expandedYears;
  @tracked el;
  @tracked yearsInView = [];
  @tracked titlesInView = [];
  @tracked coursesRelationship;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  get academicYear() {
    const today = DateTime.now();
    const thisYear = Number(today.year);
    const thisMonth = Number(today.month);
    if (thisMonth < 4) {
      return thisYear - 1;
    }

    return thisYear;
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

  get expandedYears() {
    if (this._expandedYears !== undefined) {
      return this._expandedYears;
    }
    if (this.courseYears.length) {
      const coursesThisYear = findBy(this.courseYears, 'year', this.academicYear);
      if (coursesThisYear) {
        return [this.academicYear];
      } else {
        return [this.courseYears[this.courseYears.length - 1].year];
      }
    }

    return [];
  }

  load = restartableTask(async () => {
    this.academicYearCrossesCalendarYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries',
    );
    if (this.args.school) {
      await this.dataLoader.loadSchoolForCalendar(this.args.school.id);
      this.coursesRelationship = await this.args.school.courses;
    }
  });

  @action
  scrollToLastYear(element, [year]) {
    if (year === this.academicYear - 1) {
      scrollIntoView(element.parentElement.parentElement, {
        align: { top: 0 },
      });
    }
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
