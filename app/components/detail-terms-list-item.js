/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  tagName: 'li',
  canEdit: false,
  term: null,
  click() {
    if (this.get('canEdit')) {
      let term = this.get('term');
      this.sendAction('remove', term);
    }
  },
});
