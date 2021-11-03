import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';

export default class ResolveFlatMapBy extends Resource {
  @tracked data;

  get value() {
    return this.dataUnpacked?.flat();
  }

  get dataUnpacked() {
    if (!this.data) {
      return undefined;
    }

    return this.data.map((arr) => {
      if (!arr) {
        return arr;
      }
      if (Array.isArray(arr)) {
        return arr;
      }
      return arr.toArray();
    });
  }

  async setup() {
    const arr = this.args.positional[0];
    const mapByKey = this.args.positional[1];

    //in case arr is a promise we have to resolve it.
    //this is also safe if arr isn't a promise.
    const resolvedArray = await Promise.resolve(arr);
    if (resolvedArray) {
      this.data = await Promise.all(resolvedArray.mapBy(mapByKey));
    }
  }
}
