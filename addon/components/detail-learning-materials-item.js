import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class DetailLearningMaterialsItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @use owningUser = new AsyncProcess(() => [this.getOwningUser.bind(this), this.args.lm]);
  @use meshDescriptorsResource = new ResolveAsyncValue(() => [this.args.lm.meshDescriptors]);

  get meshDescriptorsLoaded() {
    return !!this.meshDescriptorsResource;
  }

  get meshDescriptors() {
    return this.meshDescriptorsResource ? this.meshDescriptorsResource.slice() : [];
  }

  async getOwningUser(lm) {
    const learningMaterial = await lm.learningMaterial;
    return await learningMaterial.owningUser;
  }

  remove = dropTask(async (lm) => {
    await this.args.remove.perform(lm);
  });
}
