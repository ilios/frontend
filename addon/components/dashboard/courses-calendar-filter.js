import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DashboardCoursesCalendarFilterComponent extends Component {
  @service dataLoader;
  @tracked _expandedYears;
  @tracked el;
  @tracked yearsInView = [];
  @tracked titlesInView = [];
  @tracked coursesRelationship;

  get academicYear() {
    const today = moment();
    const thisYear = Number(today.format('YYYY'));
    const thisMonth = Number(today.format('M'));
    if (thisMonth < 4) {
      return thisYear - 1;
    }

    return thisYear;
  }

  get expandedYearWithoutTitleView() {
    const yearsWithNoTitle = this.yearsInView.filter((year) => !this.titlesInView.includes(year));
    const expandedYearsWithNoTitle = yearsWithNoTitle.filter((year) =>
      this.expandedYears.includes(year)
    );

    if (expandedYearsWithNoTitle.length) {
      return expandedYearsWithNoTitle[0];
    }

    return null;
  }

  get courses() {
    return this.coursesRelationship ? this.coursesRelationship.toArray() : [];
  }

  get courseYears() {
    return this.courses
      .reduce((acc, course) => {
        let year = acc.find(({ year }) => year === course.year);
        if (!year) {
          year = {
            academicYear: course.academicYear,
            year: course.year,
            courses: [],
          };
          acc.push(year);
        }
        year.courses.push(course);

        return acc;
      }, [])
      .sortBy('year');
  }

  get expandedYears() {
    if (this._expandedYears !== undefined) {
      return this._expandedYears;
    }
    if (this.courseYears.length) {
      const coursesThisYear = this.courseYears.findBy('year', this.academicYear);
      if (coursesThisYear) {
        return [this.academicYear];
      } else {
        return [this.courseYears[this.courseYears.length - 1].year];
      }
    }

    return [];
  }

  @restartableTask
  *load() {
    if (this.args.school) {
      yield this.dataLoader.loadSchoolForCalendar(this.args.school.id);
      this.coursesRelationship = yield this.args.school.courses;
    }
  }

  @action
  scrollToLastYear(element, [year]) {
    if (year === this.academicYear - 1) {
      this.el.querySelector('.filters').scrollTop =
        element.offsetTop - element.parentNode.offsetTop;
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
