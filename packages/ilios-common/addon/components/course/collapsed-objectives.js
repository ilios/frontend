import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class CourseCollapsedObjectivesComponent extends Component {
  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.course.courseObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  get objectivesWithParents() {
    return this.objectives.filter((objective) => {
      return objective.programYearObjectives.length > 0;
    });
  }

  get objectivesWithMesh() {
    return this.objectives.filter((objective) => {
      return objective.meshDescriptors.length > 0;
    });
  }

  get objectivesWithTerms() {
    return this.objectives.filter((objective) => {
      return objective.terms.length > 0;
    });
  }
}
