// /app/modifiers/on.js
import { modifier } from 'ember-modifier';

export default modifier((element, [handler, argument]) => {
  element.addEventListener('change', handler(element, argument));

  return () => {
    element.removeEventListener('change', handler);
  };
});
