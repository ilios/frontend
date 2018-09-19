/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  tagName: 'li',
  canEdit: false,
  term: null,
  classNames: ['detail-terms-list-item'],
  click() {
    if (this.canEdit) {
      let term = this.term;
      this.sendAction('remove', term);
    }
  },
});
