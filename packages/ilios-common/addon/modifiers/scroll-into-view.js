import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { default as scroll } from 'ilios-common/utils/scroll-into-view';

export default class ScrollIntoView extends Modifier {
  timeoutId;

  constructor(owner, args) {
    super(owner, args);

    registerDestructor(this, () => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    });
  }

  /**
   * @param {HTMLElement} element The HTML Element that this modifier is attached to.
   * @param {Array|undefined} positionalArgs Positional arguments to this modifier. Unused.
   * @param {Number|undefined} delay A delay in milliseconds before scrolling happens.
   * @param {Boolean|undefined} disabled Set to TRUE to prevent scrolling altogether.
   * @param {Object|undefined} opts Additional arguments to control scrolling behavior.
   */
  modify(element, positionalArgs, { delay, disabled, opts }) {
    if (delay) {
      this.timeoutId = setTimeout(() => {
        scroll(element, { disabled, opts });
      }, delay);
    } else {
      scroll(element, { disabled, opts });
    }
  }
}
