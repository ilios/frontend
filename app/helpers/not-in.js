import Ember from 'ember';

export function notIn([values, item]) {
  if(!values){
    return false;
  }
  if(!item){
    return false;
  }
  return !values.contains(item);
}

export default Ember.Helper.extend({
  values: [],
  compute: function([values, item]) {
    this.set('values', values);

    return notIn([values, item]);
  },

  recomputeOnArrayChange: Ember.observer('values.[]', function() {
    this.recompute();
  })
});
