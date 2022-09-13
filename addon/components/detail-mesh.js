import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { action } from '@ember/object';

export default class DetailMeshComponent extends Component {
  @service store;
  @service intl;

  @tracked isManaging = false;
  @tracked bufferedDescriptors = null;
  @tracked meshDescriptorRelationship;

  load = restartableTask(async () => {
    this.meshDescriptorRelationship = await this.args.subject.meshDescriptors;
  });

  get meshDescriptors() {
    if (!this.meshDescriptorRelationship) {
      return [];
    }

    return this.meshDescriptorRelationship.slice();
  }
  @action
  manage() {
    this.bufferedDescriptors = [...this.meshDescriptors];
    this.isManaging = true;
  }
  @action
  cancel() {
    this.isManaging = false;
    this.bufferedDescriptors = [];
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.bufferedDescriptors = [...this.bufferedDescriptors, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.bufferedDescriptors = this.bufferedDescriptors.filter((obj) => obj.id !== descriptor.id);
  }

  save = dropTask(async () => {
    this.args.subject.set('meshDescriptors', this.bufferedDescriptors);
    await this.args.subject.save();
    this.bufferedDescriptors = null;
    this.isManaging = false;
  });
}
