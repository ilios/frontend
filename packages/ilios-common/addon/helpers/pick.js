// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';
import { get } from '@ember/object';

export default helper(function pick([path, action] /*, named*/) {
  return function (event) {
    let value = get(event, path);

    if (!action) {
      return value;
    }

    action(value);
  };
});
