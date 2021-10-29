import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';
export default class ResolveAsyncValueResource extends Resource {
  @tracked data;

  get value() {
    return this.data;
  }

  async setup() {
    //when a second value is passed it is the default until the promise gets resolved
    if (this.args.positional.length > 1) {
      this.data = this.args.positional[1];
    }

    const val = this.args.positional[0];
    if (Array.isArray(this.args.positional[0])) {
      this.data = await Promise.all(val);
    } else {
      this.data = await val;
    }
  }
}
