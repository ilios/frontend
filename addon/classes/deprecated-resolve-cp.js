import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';
import { deprecate } from '@ember/debug';

export default class DeprecatedResolveCP extends Resource {
  @tracked data;
  deprecatedName = '';

  get value() {
    deprecate(`${this.deprecatedName} Computed Called`, false, {
      id: 'common.resolve-computed',
      for: 'ilios-common',
      until: '63',
      since: '61.2.1',
    });
    return this.data;
  }

  async setup() {
    this.deprecatedName = this.args.positional[1];
    //when a third value is passed it is the default until the promise gets resolved
    if (this.args.positional.length > 2) {
      this.data = this.args.positional[2];
    }

    const val = this.args.positional[0];
    if (Array.isArray(this.args.positional[0])) {
      this.data = await Promise.all(val);
    } else {
      this.data = await val;
    }
  }
}
