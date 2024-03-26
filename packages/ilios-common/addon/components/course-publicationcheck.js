import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class CoursePublicationCheckComponent extends Component {
  @service router;

  @cached
  get courseObjectives() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  @cached
  get showUnlinkIcon() {
    if (!this.courseObjectives.isResolved) {
      return false;
    }
    const objectivesWithoutParents = this.courseObjectives.value.filter((objective) => {
      return objective.programYearObjectives.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }
}
