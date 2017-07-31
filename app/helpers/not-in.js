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

  recomputeOnArrayChange: observer('values.[]', function() {
    this.recompute();
  })
});
