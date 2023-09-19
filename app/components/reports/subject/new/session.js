import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';

export default class ReportsSubjectNewSessionComponent extends Component {
  @service store;
  @tracked sessions;

  get uniqueId() {
    return guidFor(this);
  }

  get loadSession() {
    return this.store.findRecord('session', this.args.currentId);
  }

  get filteredSessions() {
    if (!this.sessions) {
      return [];
    }
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

  @restartableTask
  *search(q) {
    if (!q.length) {
      this.sessions = false;
      return;
    }

    this.sessions = yield this.store.query('session', {
      q: q,
      include: 'course',
    });
  }

  @action
  clear() {
    this.sessions = false;
    this.args.changeId(null);
  }
}
