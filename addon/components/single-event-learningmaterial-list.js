import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';

export default class SingleEventLearningmaterialListComponent extends Component {
  @tracked uniqueId;
  constructor() {
    super(...arguments);
    this.uniqueId = guidFor(this);
  }
}
