import Ember from 'ember';

const { Helper, observer } = Ember;

export function isIn([values, item]) {
  if (!values) {
    return false;
  }

  if (!item) {
    return false;
  }

  return values.includes(item);
}

export default Helper.extend({
  values: [],

  compute([values, item]) {
    this.set('values', values);

    return isIn([values, item]);
  },

  recomputeOnArrayChange: observer('values.[]', function() {
    this.recompute();
  })
});
