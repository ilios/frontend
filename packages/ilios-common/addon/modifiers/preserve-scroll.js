import { modifier } from 'ember-modifier';

export default modifier((element, [users, scrollTop]) => {
  if (users) {
    element.scrollTop = scrollTop;
  }
});
