import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { guidFor } from '@ember/object/internals';
import { cleanQuery } from 'ilios-common/utils/query-utils';

export default class ReportsSubjectNewCourseComponent extends Component {
  @service store;
  @tracked courses;

  get uniqueId() {
    return guidFor(this);
  }

  get filteredCourses() {
    if (this.args.school) {
      const schoolId = Number(this.args.school.id);
      return this.courses.filter((c) => {
        console.log(Number(c.belongsTo('school').id()), schoolId);
        return Number(c.belongsTo('school').id()) === schoolId;
      });
    }

    return this.courses;
  }

  get sortedCourses() {
    return sortBy(this.filteredCourses, ['year', 'title']);
  }

  get q() {
    return cleanQuery(this.query);
  }

  @restartableTask
  *search() {
    if (!this.q.length) {
      this.courses = false;
      return;
    }

    this.courses = yield this.store.query('course', {
      q: this.q,
    });
  }

  @action
  keyboard({ keyCode }) {
    //enter key
    if (keyCode === 13) {
      this.search.perform();
    }
  }
}
