import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { hash } from 'rsvp';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewSessionComponent extends Component {
  @service store;

  @tracked selectedYear;

  @cached
  get data() {
    return new TrackedAsyncData(
      hash({
        sessions: this.store.findAll('session'),
        courses: this.store.findAll('course'),
        years: this.store.findAll('academic-year'),
      })
    );
  }

  get isLoaded() {
    return this.data.isResolved;
  }

  get sessions() {
    return this.data.value.sessions;
  }

  get years() {
    return this.data.value.years;
  }

  get filteredYears() {
    const sessionYears = this.filteredSessionsBySchool.map((session) => {
      const courseId = session.belongsTo('course').id();
      const course = this.data.value.courses.find(({ id }) => id === courseId);

      return Number(course.year);
    });
    return this.years.filter(({ id }) => sessionYears.includes(Number(id)));
  }

  get filteredSessions() {
    if (this.selectedYear) {
      return this.filteredSessionsBySchool.filter((session) => {
        const courseId = session.belongsTo('course').id();
        const course = this.data.value.courses.find(({ id }) => id === courseId);

        return course.year === Number(this.selectedYear);
      });
    }

    return this.filteredSessionsBySchool;
  }

  get filteredSessionsBySchool() {
    if (this.args.school) {
      return this.sessions.filter((session) => {
        const courseId = session.belongsTo('course').id();
        const course = this.data.value.courses.find(({ id }) => id === courseId);

        return course.belongsTo('school').id() === this.args.school.id;
      });
    }

    return this.sessions;
  }

  get sortedSessions() {
    return sortBy(this.filteredSessions, 'course.year', 'course.title', 'title');
  }

  @action
  changeSelectedYear(year) {
    this.selectedYear = year;
    this.setInitialValue.perform();
  }

  @task
  *setInitialValue() {
    yield timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedSessions.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedSessions.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedSessions[0].id);
    }
  }
}
