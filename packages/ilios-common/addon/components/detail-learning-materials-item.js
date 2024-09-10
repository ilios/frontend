import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailLearningMaterialsItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @cached
  get owningUserData() {
    return new TrackedAsyncData(this.getOwningUser(this.args.lm));
  }

  get owningUser() {
    return this.owningUserData.isResolved ? this.owningUserData.value : null;
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.lm.meshDescriptors);
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : [];
  }

  get meshDescriptorsLoaded() {
    return this.meshDescriptorsData.isResolved;
  }

  async getOwningUser(lm) {
    const learningMaterial = await lm.learningMaterial;
    return await learningMaterial.owningUser;
  }

  remove = dropTask(async (lm) => {
    await this.args.remove.perform(lm);
  });
}
