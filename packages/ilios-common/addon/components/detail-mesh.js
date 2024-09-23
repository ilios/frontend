import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailMeshComponent extends Component {
  @tracked isManaging = false;
  @tracked bufferedDescriptors = null;
  @tracked meshDescriptorRelationship;

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.subject.meshDescriptors);
  }

  get meshDescriptors() {
    if (!this.meshDescriptorsData.isResolved) {
      return [];
    }

    return this.meshDescriptorsData.value;
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
