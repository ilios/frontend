import Ember from 'ember';

const { Helper, observer } = Ember;

export function notIn([values, item]) {
  if (!values) {
    return false;
  }

  if (!item) {
    return false;
  }

  return !values.contains(item);
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
