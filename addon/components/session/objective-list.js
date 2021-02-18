import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default class SessionObjectiveListComponent extends Component {
  @service store;
  @service intl;

  @tracked sessionObjectives;
  @tracked isSorting = false;
  @tracked courseObjectives;
  @tracked course;
  @tracked sessionObjectiveCount;

  @restartableTask
  *load(element, [session]) {
    if (!session) {
      return;
    }
    this.sessionObjectiveCount = session.hasMany('sessionObjectives').ids().length;
    this.course = yield session.course;
    const { sessionObjectives, courseObjectives } = yield hash({
      sessionObjectives: session.sortedSessionObjectives,
      courseObjectives: this.course.courseObjectives,
    });
    this.sessionObjectives = sessionObjectives;
    this.courseObjectives = courseObjectives;
  }
}
