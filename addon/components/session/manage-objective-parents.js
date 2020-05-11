import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { all } from 'rsvp';

export default class SessionManageObjectiveParents extends Component {

  @tracked objectivesInCourse = [];

  @restartableTask
  *load(element, [courseObjectives]) {
    if (!courseObjectives) {
      this.courseObjectives = [];
      return;
    }
    this.objectivesInCourse = yield all(courseObjectives.toArray().mapBy('objective'));
  }
}
