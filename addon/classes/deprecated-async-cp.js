import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';
import { deprecate } from '@ember/debug';

export default class DeprecatedAsyncCP extends Resource {
  @tracked data;
  @tracked promise;
  deprecatedName = '';

  get value() {
    deprecate(`${this.deprecatedName} Computed Called`, false, {
      id: 'common.async-cohort-computed',
      for: 'ilios-common',
      until: '61',
      since: '59.4.0',
    });
    return this.data ?? this.promise;
  }

  async setup() {
    const fn = this.args.positional[0];
    this.deprecatedName = this.args.positional[1];

    //pass any remaining arguments directly to the processor function
    this.promise = fn(...this.args.positional.slice(2));
    this.data = await this.promise;
  }
}
