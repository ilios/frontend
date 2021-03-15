import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';
export default class ResolveAllValuesResource extends Resource {
  @tracked data = [];

  get value() {
    return this.data;
  }

  async setup() {
    if (Array.isArray(this.args.positional[0])) {
      this.data = await Promise.all(this.args.positional[0]);
    }
  }
}
