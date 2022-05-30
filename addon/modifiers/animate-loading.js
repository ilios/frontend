import { modifier } from 'ember-modifier';

export default modifier(function animateLoading(element) {
  element.classList.add('animate-loading');
  const timeout = setTimeout(() => element.classList.remove('animate-loading'), 1);

  return () => {
    clearTimeout(timeout);
  };
});
