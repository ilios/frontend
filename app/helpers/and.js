import Ember from 'ember';

const { isBlank, Helper, observer, run } = Ember;
const { once } = run;

export function and(params) {
  const validate = isBlank(params) || isBlank(params[0]) || isBlank(params[1]);

  return validate ? false : params[0] && params[1];
}

export default Helper.extend({
  value1: null,
  value2: null,

  compute([ value1, value2 ]) {
    this.setProperties({ value1, value2 });

    return and([ value1, value2 ]);
  },

  recomputeOnArrayChange: observer('value1', 'value2', function() {
    once(this, () => {
      this.recompute();
    });
  })
});
