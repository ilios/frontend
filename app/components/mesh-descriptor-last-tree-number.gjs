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
    return this.trees.value.toReversed()[0].treeNumber;
  }
  <template>
    <span
      class="mesh-descriptor-last-tree-number"
      data-test-mesh-descriptor-last-tree-number
      ...attributes
    >
      {{this.value}}
    </span>
  </template>
}
