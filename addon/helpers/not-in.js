/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import Helper from '@ember/component/helper';
import { observer } from '@ember/object';

export function notIn([values, item]) {
  if (!values) {
    return false;
  }

  if (!item) {
    return false;
  }

  return !values.includes(item);
}

export default Helper.extend({
  values: [],

  compute([values, item]) {
    this.set('values', values);

    return notIn([values, item]);
  },

  /* eslint ember/no-observers: 0 */
  recomputeOnArrayChange: observer('values.[]', function() {
    this.recompute();
  })
});
