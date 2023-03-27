// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import asArray from 'ilios-common/utils/as-array';

export default helper(function join([separator, rawArray]) {
  let array = asArray(rawArray);
  return array.join(separator);
});
