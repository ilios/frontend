import { modifier } from 'ember-modifier';

export default modifier(
  function mouseHoverToggle(element, [setter]) {
    const handleMouseOver = () => setter(true);
    const handleMouseOut = () => setter(false);
    element.addEventListener('mouseover', handleMouseOver);
    element.addEventListener('mouseout', handleMouseOut);

    return () => {
      element.removeEventListener('mouseover', handleMouseOver);
      element.removeEventListener('mouseout', handleMouseOut);
    };
  },
  { eager: false }
);
