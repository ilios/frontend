import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';
export default  class AsyncProcessResource extends Resource {
  @tracked data;

  get value() {
    return this.data;
  }

  async setup() {
    this.data = await this.args.positional[0];
  }
}
