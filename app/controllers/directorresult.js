import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyeardirectors'],
  programYearDirectors: Ember.computed.alias("controllers.programyeardirectors"),
  selected: function(){
    var self = this;
    var selected = false;
    this.get('programYearDirectors.directors').forEach(function(user){
      if(user.get('id') === self.get('model').get('id')){
        selected = true;
      }
    });
    return selected;
  }.property('model', 'programYearDirectors.directors.@each'),
  actions: {
    add: function(user){
      this.get('programYear.model.directors').addObject(user);
      this.set('programYear.isDirty', true);
    },
  }
});
