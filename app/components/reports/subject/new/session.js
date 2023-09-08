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
  @tracked sessions;

  get uniqueId() {
    return guidFor(this);
  }

  get filteredSessions() {
    if (this.args.school) {
      const schoolId = Number(this.args.school.id);
      return this.sessions.filter((session) => {
        const courseId = session.belongsTo('course').id();
        const course = this.store.peekRecord('course', courseId);

        return Number(course.belongsTo('school').id()) === schoolId;
      });
    }

    return this.sessions;
  }

  get sortedSessions() {
    return sortBy(this.filteredSessions, 'course.year', 'course.title', 'title');
  }

  get q() {
    return cleanQuery(this.query);
  }

  @restartableTask
  *search() {
    if (!this.q.length) {
      this.sessions = false;
      return;
    }

    this.sessions = yield this.store.query('session', {
      q: this.q,
      include: 'course',
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
