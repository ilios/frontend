import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class ReportsSubjectNewCourseComponent extends Component {
  @service store;
  @tracked courses;

  get loadCourse() {
    return this.store.findRecord('course', this.args.currentId);
  }

  get uniqueId() {
    return guidFor(this);
  }

  get filteredCourses() {
    if (!this.courses) {
      return [];
    }
    if (this.args.school) {
      const schoolId = Number(this.args.school.id);
      return this.courses.filter((c) => {
        return Number(c.belongsTo('school').id()) === schoolId;
      });
    }

    return this.courses;
  }

  get sortedCourses() {
    return this.filteredCourses.slice().sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return a.title.localeCompare(b.title);
    });
  }

  search = restartableTask(async (q) => {
    if (!q.length) {
      this.courses = false;
      return;
    }

    this.courses = await this.store.query('course', {
      q,
    });
  });

  @action
  clear() {
    this.courses = false;
    this.args.changeId(null);
  }
}
