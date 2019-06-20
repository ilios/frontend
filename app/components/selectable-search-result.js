import Component from '@ember/component';
import { A } from '@ember/array';
import { computed } from '@ember/object';

export default Component.extend({
  item: null,
  selectedItems: A(),

  selected: computed('item', 'selectedItems.[]', function() {
    return this.selectedItems.includes(this.item);
  }),

  click() {
    this.action(this.item);
  }
});
