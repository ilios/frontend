import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  selectedItems: Ember.A(),
  item: null,
  selected: computed('item', 'selectedItems.[]', function(){
    return this.get('selectedItems').includes(this.item);
  }),
  click() {
    this.sendAction('action', this.get('item'));
  }
});
