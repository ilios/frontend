import { modifier } from 'ember-modifier';

export default modifier(function inViewport(element, positional, { onEnter, onExit, ...options }) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      onEnter?.();
    } else {
      onExit?.();
    }
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
});
