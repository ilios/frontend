import { modifier } from 'ember-modifier';

export default modifier(function scrollIntoView(element, [block = "start"]) {
  element.scrollIntoView({ block });
});
