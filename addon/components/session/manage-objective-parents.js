import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { all } from 'rsvp';

export default class SessionMeshObjectiveParents extends Component {

  @tracked courseObjectives = [];

  @restartableTask
  *load(element, [courseObjectives]) {
    if (!courseObjectives) {
      this.courseObjectives = [];
      return;
    }
    this.courseObjectives = yield all(courseObjectives.toArray().mapBy('objective'));
  }
}
