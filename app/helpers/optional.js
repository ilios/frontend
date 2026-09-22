// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';

export default helper(function optional([action]) {
  if (typeof action === 'function') {
    return action;
  }

  return (i) => i;
});
