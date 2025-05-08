import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ProgramYearCollapsedObjectivesComponent extends Component {
  @cached
  get objectivesData() {
    return new TrackedAsyncData(this.args.programYear.programYearObjectives);
  }

  get objectives() {
    return this.objectivesData.isResolved ? this.objectivesData.value : [];
  }

  get objectivesWithCompetency() {
    return this.objectives.filter((objective) => {
      return !!objective.belongsTo('competency').id();
    });
  }

  get objectivesWithMesh() {
    return this.objectives.filter((objective) => {
      const meshDescriptorIds = objective.hasMany('meshDescriptors').ids();
      return meshDescriptorIds.length > 0;
    });
  }

  get objectivesWithTerms() {
    return this.objectives.filter((objective) => {
      const termIds = objective.hasMany('terms').ids();
      return termIds.length > 0;
    });
  }
}
