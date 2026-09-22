// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { typeOf } from '@ember/utils';

export default function isObject(val) {
  return typeOf(val) === 'object' || typeOf(val) === 'instance';
}
