import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionCollapsedObjectivesComponent extends Component {
  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.session.sessionObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  get objectivesWithParents() {
    return this.objectives.filter((objective) => {
      return objective.hasMany('courseObjectives').ids().length > 0;
    });
  }

  get objectivesWithMesh() {
    return this.objectives.filter((objective) => {
      return objective.hasMany('meshDescriptors').ids().length > 0;
    });
  }

  get objectivesWithTerms() {
    return this.objectives.filter((objective) => {
      return objective.hasMany('terms').ids().length > 0;
    });
  }
}
