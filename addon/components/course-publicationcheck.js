/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class CoursePublicationCheckComponent extends Component {
  @service router;

  @use courseObjectives = new ResolveAsyncValue(() => [this.args.course.courseObjectives, []]);

  get showUnlinkIcon() {
    const objectivesWithoutParents = this.courseObjectives.filter((objective) => {
      return objective.programYearObjectives.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }
}
