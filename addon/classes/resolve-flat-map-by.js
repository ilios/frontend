import { tracked } from '@glimmer/tracking';
import { Resource } from 'ember-could-get-used-to-this';
import { mapBy } from '../utils/array-helpers';

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
      if ('toArray' in arr) {
        return arr.slice();
      }

      return arr;
    });
  }

  async setup() {
    const arr = this.args.positional[0];
    const mapByKey = this.args.positional[1];

    if (arr) {
      //consume the mapBy on each to entangle tracking
      arr.forEach((element) => element[mapByKey]);
    }

    //in case arr is a promise we have to resolve it.
    //this is also safe if arr isn't a promise.
    const resolvedArray = await Promise.resolve(arr);
    if (resolvedArray) {
      if ('mapBy' in resolvedArray) {
        //Ember data models return a promise from `mapBy`
        //so we need to resolve it and then resolve the values in it
        const mapBy = await resolvedArray.mapBy(mapByKey);
        this.data = await Promise.all(mapBy);
      } else {
        this.data = await Promise.all(mapBy(resolvedArray, mapByKey));
      }
    }
  }
}
