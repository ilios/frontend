import Component from '@ember/component';

export default Component.extend({
  classNames: ['sessions-grid-loading'],
  attributeBindings: ['ariaHidden:aria-hidden', 'role'],
  ariaHidden: 'true',
  role: 'presentation',
});
