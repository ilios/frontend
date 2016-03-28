import Ember from 'ember';

const { isBlank, Helper, observer, run } = Ember;
const { once } = run;

export function isEmpty(params) {
  return isBlank(params[0]);
}

export default Helper.extend({
  value1: null,

  compute([ value1 ]) {
    this.setProperties({ value1 });

    return isEmpty([ value1 ]);
  },

  recomputeOnArrayChange: observer('value1', function() {
    once(this, () => {
      this.recompute();
    });
  })
});
