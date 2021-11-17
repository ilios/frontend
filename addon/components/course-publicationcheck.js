/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CoursePublicationCheckComponent extends Component {
  @service router;

  get showUnlinkIcon() {
    if (!this.args.course.courseObjectives) {
      return false;
    }
    const objectivesWithoutParents = this.args.course.courseObjectives.filter((objective) => {
      const parentIds = objective.hasMany('programYearObjectives').ids();
      return parentIds.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }
}
