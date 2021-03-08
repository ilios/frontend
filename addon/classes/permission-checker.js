import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { Resource } from 'ember-could-get-used-to-this';

export default class PermissionCheckerResource extends Resource {
  @service permissionChecker;
  @tracked data;

  get value() {
    return this.data;
  }

  async setup() {
    const fnName = this.args.positional[0];
    //pass any remaining arguments directly to the processor function
    this.data = await this.permissionChecker[fnName](...this.args.positional.slice(1));
  }
}
