import Component from '@ember/component';

export default Component.extend({
  tagName: 'tbody',
  classNames: ['sessions-grid-loading'],
  attributeBindings: ['ariaHidden:aria-hidden', 'role'],
  ariaHidden: 'true',
  role: 'presentation',
});
