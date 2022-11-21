// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import { A, isArray as isEmberArray } from '@ember/array';

export default helper(function objectAt([index, array]) {
  if (!isEmberArray(array)) {
    return undefined;
  }

  index = parseInt(index, 10);

  return A(array).objectAt(index);
});
