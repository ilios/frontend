// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import asArray from '../utils/as-array';

export default helper(function includes([needle, haystack]) {
  const haystackAsArray = asArray(haystack);
  const needles = Array.isArray(needle) ? needle : [needle];
  return needles.every((needle) => {
    return haystackAsArray.includes(needle);
  });
});
