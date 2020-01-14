import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

export default class DetailMeshComponent extends Component {
  @service store;
  @service intl;

  @tracked isManaging = false;
  @tracked bufferedDescriptors = null;
  @tracked meshDescriptors = null;

  @action
  load(event, [meshDescriptors]) {
    if (!meshDescriptors) {
      return;
    }
    this.meshDescriptors = meshDescriptors.toArray();
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
    this.bufferedDescriptors = this.bufferedDescriptors.filter(obj => obj.id !== descriptor.id);
  }

  @dropTask
  *save() {
    this.args.subject.set('meshDescriptors', this.bufferedDescriptors);
    yield this.args.subject.save();
    this.bufferedDescriptors = null;
    this.isManaging = false;
  }
}
