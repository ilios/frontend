import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DetailCompetenciesComponent extends Component {
  @tracked hasCompetencies = false;
  @tracked competencyCount;

  @action
  load(event, [competencies]) {
    if (!competencies) {
      return;
    }
    this.competencyCount = competencies.length;
    this.hasCompetencies = this.competencyCount > 0;
  }

  @action
  collapse() {
    if (this.hasCompetencies) {
      this.args.collapse();
    }
  }
}
