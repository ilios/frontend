import Component from '@glimmer/component';

export default class WeekGlanceEvent extends Component {
  sortString(a, b) {
    return a.localeCompare(b);
  }
  get hasSessionLearningMaterials() {
    return this.sessionLearningMaterials.length > 0;
  }
  get sessionLearningMaterials() {
    return this.args.event.learningMaterials?.filterBy('sessionLearningMaterial') ?? [];
  }
}
