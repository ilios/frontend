// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import isPromise from 'ilios-common/utils/is-promise';

export function invokeFunction(acc, curr) {
  if (isPromise(acc)) {
    return acc.then(curr);
  }

  return curr(acc);
}

export default helper(function pipe(actions = []) {
  return function (...args) {
    return actions.reduce((acc, curr, idx) => {
      if (idx === 0) {
        return curr(...args);
      }

      return invokeFunction(acc, curr);
    }, undefined);
  };
});
