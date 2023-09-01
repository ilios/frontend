import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { hash } from 'rsvp';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewCourseComponent extends Component {
  @service store;

  @tracked selectedYear;

  @cached
  get data() {
    return new TrackedAsyncData(
      hash({
        courses: this.store.findAll('course'),
        years: this.store.findAll('academic-year'),
      }),
    );
  }

  get isLoaded() {
    return this.data.isResolved;
  }

  get courses() {
    return this.data.value.courses;
  }

  get years() {
    return this.data.value.years;
  }

  get filteredYears() {
    const courseYears = this.filteredCoursesBySchool.map((c) => Number(c.year));
    return this.years.filter(({ id }) => courseYears.includes(Number(id)));
  }

  get filteredCourses() {
    if (this.selectedYear) {
      return this.filteredCoursesBySchool.filter((c) => c.year === Number(this.selectedYear));
    }

    return this.filteredCoursesBySchool;
  }

  get filteredCoursesBySchool() {
    if (this.args.school) {
      return this.courses.filter((c) => c.belongsTo('school').id() === this.args.school.id);
    }

    return this.courses;
  }

  get sortedCourses() {
    return sortBy(this.filteredCourses, ['year', 'title']);
  }

  @action
  changeSelectedYear(year) {
    this.selectedYear = year;
    this.setInitialValue.perform();
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedCourses.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedCourses.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedCourses[0].id);
    }
  }
}
