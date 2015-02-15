import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    //use the global jquery here and not the ember one
    //because we need access to the global scope
    $('#initialpageloader').remove();
  }
});
