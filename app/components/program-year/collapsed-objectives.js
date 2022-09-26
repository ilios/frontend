import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class ProgramYearCollapsedObjectivesComponent extends Component {
  @tracked objectives;
  @tracked objectivesWithCompetency;
  @tracked objectivesWithMesh;
  @tracked objectivesWithTerms;

  load = restartableTask(async (element, [objectivePromise]) => {
    if (!objectivePromise) {
      return false;
    }
    this.objectives = await objectivePromise;

    this.objectivesWithCompetency = this.objectives.filter((objective) => {
      return !!objective.belongsTo('competency').id();
    });
    this.objectivesWithMesh = this.objectives.filter((objective) => {
      const meshDescriptorIds = objective.hasMany('meshDescriptors').ids();
      return meshDescriptorIds.length > 0;
    });
    this.objectivesWithTerms = this.objectives.filter((objective) => {
      const termIds = objective.hasMany('terms').ids();
      return termIds.length > 0;
    });

    return true;
  });
}
