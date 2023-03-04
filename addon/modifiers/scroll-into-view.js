import { modifier } from 'ember-modifier';
import { next } from '@ember/runloop';

export default modifier(
  function scrollIntoView(element, [block = 'start']) {
    next(() => {
      if (element) {
        element.scrollIntoView({ block });
      }
    });
  },
  { eager: false }
);
