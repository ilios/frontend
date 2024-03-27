import { modifier } from 'ember-modifier';
import { scheduleOnce } from '@ember/runloop';
import { default as scroll } from 'scroll-into-view';

export default modifier(function scrollIntoView(element, positional, { disabled }) {
  function deferredScroll() {
    scroll(element, { align: { top: 0 } });
  }
  if (!disabled) {
    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', deferredScroll);
  }
});
