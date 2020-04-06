import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default class SessionObjectiveListComponent extends Component {
  @service store;
  @service intl;

  @tracked objectives;
  @tracked isSorting = false;
  @tracked courseObjectives;
  @tracked course;
  @tracked objectiveCount;

  @restartableTask
  *load(element, [session]) {
    if (!session) {
      return;
    }
    this.objectiveCount = session.hasMany('objectives').ids().length;
    this.course = yield session.course;
    const {
      objectives,
      courseObjectives
    } = yield hash({
      objectives: session.sortedObjectives,
      courseObjectives: this.course.objectives
    });
    this.objectives = objectives;
    this.courseObjectives = courseObjectives;
  }
}
