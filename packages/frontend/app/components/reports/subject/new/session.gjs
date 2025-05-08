import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
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
    return this.filteredSessions.slice().sort((a, b) => {
      const courseA = this.store.peekRecord('course', a.belongsTo('course').id());
      const courseB = this.store.peekRecord('course', b.belongsTo('course').id());

      if (courseA.year !== courseB.year) {
        return courseB.year - courseA.year;
      }

      const courseTitleCompare = courseA.title.localeCompare(courseB.title);
      if (courseTitleCompare !== 0) {
        return courseTitleCompare;
      }

      return a.title.localeCompare(b.title);
    });
  }

  search = restartableTask(async (q) => {
    if (!q.length) {
      this.sessions = false;
      return;
    }

    this.sessions = await this.store.query('session', {
      q: q,
      include: 'course',
    });
  });

  @action
  clear() {
    this.sessions = false;
    this.args.changeId(null);
  }
}
