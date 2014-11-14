import Ember from 'ember';

export default Ember.Component.extend({
  selectedItems: Ember.A(),
  item: null,
  selected: function(){
    return this.get('selectedItems').contains(this.item);
  }.property('item', 'selectedItems.@each'),
  click: function() {
    this.sendAction('action', this.get('item'));
  }
});
