// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';

export default helper(function queue(actions = []) {
  return function (...args) {
    let invokeWithArgs = function (acc, curr) {
      return curr(...args);
    };

    return actions.reduce((acc, curr, idx) => {
      if (idx === 0) {
        return curr(...args);
      }

      return invokeWithArgs(acc, curr);
    }, undefined);
  };
});
