import Component from '@ember/component';
import layout from '../templates/components/sessions-grid-loading';

export default Component.extend({
  layout,
  classNames: ['sessions-grid-loading'],
  attributeBindings: ['ariaHidden:aria-hidden', 'role'],
  ariaHidden: 'true',
  role: 'presentation',
});
