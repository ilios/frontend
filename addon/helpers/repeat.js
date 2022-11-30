// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import { typeOf } from '@ember/utils';

export default helper(function repeat([length, value]) {
  if (typeOf(length) !== 'number') {
    return [value];
  }
  return Array.apply(null, { length }).map(() => value); // eslint-disable-line
});
