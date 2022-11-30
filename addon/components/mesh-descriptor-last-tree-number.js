import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class MeshDescriptorLastTreeNumber extends Component {
  @use trees = new ResolveAsyncValue(() => [this.args.descriptor.trees]);

  get value() {
    if (!this.trees || !this.trees.length) {
      return '';
    }
    return this.trees.toArray().reverse()[0].treeNumber;
  }
}
