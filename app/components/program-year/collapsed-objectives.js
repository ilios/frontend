import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class ProgramYearCollapsedObjectivesComponent extends Component {
  @tracked objectives;
  @tracked objectivesWithCompetency;
  @tracked objectivesWithMesh;

  @restartableTask
  *load(element, [objectivePromise]) {
    if (!objectivePromise) {
      return false;
    }
    this.objectives = yield objectivePromise;

    this.objectivesWithCompetency = this.objectives.filter(objective => {
      return !!objective.belongsTo('competency').id();
    });
    this.objectivesWithMesh = this.objectives.filter(objective => {
      const meshDescriptorIds = objective.hasMany('meshDescriptors').ids();

      return meshDescriptorIds.length > 0;
    });

    return true;
  }
}
