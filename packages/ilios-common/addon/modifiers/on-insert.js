import { modifier } from 'ember-modifier';

export default modifier((element, [callback]) => {
  if (typeof callback === 'function') {
    callback(element);
  } else {
    console.error('Invalid callback provided');
  }
});
