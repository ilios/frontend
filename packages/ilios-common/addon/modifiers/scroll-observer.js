// app/modifiers/global-scroll.js
import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

export default class ScrollObserverModifier extends Modifier {
  @service globalScroll;

  modify(element) {
    // Capture `element` via closure
    const handler = (event) => {
      this.globalScroll.onScroll(event, element);
    };

    window.addEventListener('scroll', handler, { passive: true });

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }
}
