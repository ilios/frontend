import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class DetailLearningMaterialsItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  remove = dropTask(async (lm) => {
    await this.args.remove.perform(lm);
  });
}
