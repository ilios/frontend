import Ember from 'ember';

export default Ember.ObjectController.extend({
  selected: function(){
    var self = this;
    var selected = false;
    this.get('parentController.model.users').forEach(function(user){
     if(user.get('id') === self.get('id')){
       selected = true;
     }
    });
    return selected;
  }.property('parentController.model.users.@each')
});
