/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import Helper from '@ember/component/helper';
import { observer } from '@ember/object';

export function intersectionCount([a, b]/*, hash*/) {
  if (! isArray(a) || ! isArray(b) || isEmpty(a) || isEmpty(b)) {
    return 0;
  }

  if (a.length > b.length) {
    let tmp = a;
    a = b;
    b = tmp;
  }

  let count = 0;
  a.forEach((item) => {
    if (b.includes(item)) {
      count++;
    }
  });

  return count;
}

export default Helper.extend({
  a: [],
  b: [],

  compute([a, b]) {
    this.set('a', a);
    this.set('b', b);
    return intersectionCount([a, b]);
  },

  /* eslint ember/no-observers: 0 */
  recomputeOnArrayChange: observer('a.[]', 'b.[]', function() {
    this.recompute();
  })
});
