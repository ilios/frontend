import { modifier } from 'ember-modifier';

/**
  The `{{get-element}}` modifier gets a reference to an element and sends it to a method.

  For example - getting the root element of a component to be used in the class.

  ```handlebars
  <div {{get-element this.doStuffWithElement}}>
    <!-- Content -->
  </div>
  ```
*/
export default modifier(function getElement(element, [callback]) {
  if (typeof callback === 'function') {
    callback(element);
  } else {
    return null;
  }
});
