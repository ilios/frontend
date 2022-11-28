// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';

export default helper(function reverse([array]) {
  if (!Array.isArray(array)) {
    return [array];
  }

  return array.slice(0).reverse();
});
