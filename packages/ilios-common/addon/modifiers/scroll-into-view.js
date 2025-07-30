import { modifier } from 'ember-modifier';
import { scheduleOnce } from '@ember/runloop';

export default modifier(function scrollIntoView(element, positional, { disabled }) {
  function deferredScroll() {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    element?.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
  }
  if (!disabled) {
    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', deferredScroll);
  }
});
