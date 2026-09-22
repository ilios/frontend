import { triggerKeyEvent } from '@ember/test-helpers';

export function keyOnFocus(key) {
  return {
    isDescriptor: true,

    get() {
      return function () {
        return triggerKeyEvent(document.activeElement, 'keydown', key);
      };
    },
  };
}
