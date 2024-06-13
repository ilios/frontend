import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionObjectiveListComponent extends Component {
  @tracked isSorting = false;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get courseObjectivesData() {
    return new TrackedAsyncData(this.course?.courseObjectives);
  }

  @cached
  get sessionObjectivesData() {
    return new TrackedAsyncData(this.args.session.sortedSessionObjectives);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get courseObjectives() {
    return this.courseObjectivesData.isResolved ? this.courseObjectivesData.value : null;
  }

  get sessionObjectives() {
    return this.sessionObjectivesData.isResolved ? this.sessionObjectivesData.value : null;
  }

  get sessionObjectiveCount() {
    return this.sessionObjectives?.length ?? 0;
  }
}
