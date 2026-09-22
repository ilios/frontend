// taken from Ember Composable Helpers (https://github.com/DockYard/ember-composable-helpers), then modified.
import { helper } from '@ember/component/helper';

export default helper(function noopTask() {
  return {
    perform: async () => {
      return true;
    },
    isRunning: false,
  };
});
