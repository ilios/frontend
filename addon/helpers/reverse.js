// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import { A as emberArray, isArray as isEmberArray } from '@ember/array';

export default helper(function reverse([array]) {
  if (!isEmberArray(array)) {
    return [array];
  }

  return emberArray(array).slice(0).reverse();
});
