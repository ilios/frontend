/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/detail-terms-list-item';

export default Component.extend({
  layout,
  tagName: 'li',
  canEdit: false,
  term: null,
  classNames: ['detail-terms-list-item'],
  click() {
    if (this.get('canEdit')) {
      let term = this.get('term');
      this.sendAction('remove', term);
    }
  },
});
