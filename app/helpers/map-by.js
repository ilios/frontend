// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import asArray from '../utils/as-array';

export default helper(function mapBy([byPath, array]) {
  if (isEmpty(byPath)) {
    return [];
  }

  return asArray(array).map((item) => get(item, byPath));
});
