import { isBlank } from '@ember/utils';
import Helper from '@ember/component/helper';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';
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

  /* eslint ember/no-observers: 0 */
  recomputeOnArrayChange: observer('value1', function() {
    once(this, () => {
      this.recompute();
    });
  })
});
