import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DashboardCoursesCalendarFilterComponent extends Component {
  @service store;
  @tracked courseYears = [];
  @tracked expandedYears = [];
  @tracked el;

  get academicYear() {
    const today = moment();
    const thisYear = Number(today.format('YYYY'));
    const thisMonth = Number(today.format('M'));
    if (thisMonth < 4) {
      return thisYear - 1;
    }

    return thisYear;
  }

  @restartableTask
  *load(element, [school]) {
    this.el = element;
    if (!school) {
      return;
    }
    const courses = yield this.store.query('course', {
      filters: {
        school: school.id,
      },
    });
    this.courseYears = courses.reduce((acc, course) => {
      let year = acc.find(({ year }) => year === course.year);
      if (!year) {
        year = {
          academicYear: course.academicYear,
          year: course.year,
          courses: []
        };
        acc.push(year);
      }
      year.courses.push(course);

      return acc;
    }, []).sortBy('year');
    if (this.courseYears.length) {
      const coursesThisYear = this.courseYears.findBy('year', this.academicYear);
      if (coursesThisYear) {
        this.expandedYears = [this.academicYear];
      } else {
        this.expandedYears = [this.courseYears[this.courseYears.length - 1].year];
      }
    }

  }

  @action
  scrollToLastYear(element, [year]) {
    if (year === this.academicYear - 1) {
      this.el.querySelector('.filters').scrollTop = element.offsetTop - element.parentNode.offsetTop;
    }
  }

  @action
  toggleYear(year) {
    if (this.expandedYears.includes(year)) {
      this.expandedYears = this.expandedYears.filter(theYear => theYear !== year);
    } else {
      this.expandedYears = [...this.expandedYears, year];
    }
  }
}
