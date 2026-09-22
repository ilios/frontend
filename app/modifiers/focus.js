import { modifier } from 'ember-modifier';

/**
  The `{{focus}}` element modifier sets the focus its DOM element.
  It can take one optional boolean argument, which can be used to conditionally allow or prevent focusing.

  For example - focusing the first item in an ordered list:

  ```handlebars
  <ol>
  {{#each @items as |item index|}}
    <li {{focus (eq index 0)}}>
  {{/each}
  </ol>
  ```
*/
export default modifier(function focus(element, positional /*, named*/) {
  // If no argument is provided, then the given element is focused on.
  // If an argument has been provided, then only set focus if that arg is truthy.
  if (!positional.length || !!positional[0]) {
    element.focus();
  }
});
