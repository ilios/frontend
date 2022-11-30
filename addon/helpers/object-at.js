// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';

export default helper(function objectAt([index, array]) {
  if (!Array.isArray(array)) {
    return undefined;
  }
  index = parseInt(index, 10);
  return array[index];
});
