import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { default as scroll } from 'ilios-common/utils/scroll-into-view';

export default class ScrollIntoView extends Modifier {
  timeoutId;

  constructor(owner, args) {
    super(owner, args);

    registerDestructor(this, () => {
      clearTimeout(this.timeoutId);
    });
  }

  modify(element, positionalArgs, { disabled, opts }) {
    this.timeoutId = setTimeout(() => {
      scroll(element, { disabled, opts });
    }, 10);
  }
}
