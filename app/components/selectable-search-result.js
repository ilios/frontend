import { A } from '@ember/array';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  selectedItems: A(),
  item: null,
  selected: computed('item', 'selectedItems.[]', function(){
    return this.get('selectedItems').includes(this.item);
  }),
  click() {
    this.sendAction('action', this.get('item'));
  }
});
