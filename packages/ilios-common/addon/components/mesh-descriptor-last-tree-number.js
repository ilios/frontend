import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class MeshDescriptorLastTreeNumber extends Component {
  @cached
  get trees() {
    return new TrackedAsyncData(this.args.descriptor.trees);
  }

  get value() {
    if (!this.trees.isResolved || !this.trees.value.length) {
      return '';
    }
    return this.trees.value.slice().reverse()[0].treeNumber;
  }
}
