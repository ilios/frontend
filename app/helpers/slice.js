// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import asArray from '../utils/as-array';

export default helper(function slice([...args]) {
  let array = args.pop();
  array = asArray(array);
  return array.slice(...args);
});
