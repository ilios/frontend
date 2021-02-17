/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';
import { restartableTask } from 'ember-concurrency';

export default class CoursePublicationCheckComponent extends Component {
  @service router;
  @tracked objectivesRelationship;

  @computed('objectivesRelationship.@each.programYearObjectives')
  get showUnlinkIcon() {
    if (!this.objectivesRelationship) {
      return false;
    }
    const objectivesWithoutParents = this.objectivesRelationship.filter((objective) => {
      const parentIds = objective.hasMany('programYearObjectives').ids();
      return parentIds.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }

  @restartableTask
  *load() {
    this.objectivesRelationship = yield this.args.course.courseObjectives;
  }
}
