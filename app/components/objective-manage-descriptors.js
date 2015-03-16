import Ember from 'ember';
import layout from '../templates/components/objective-manage-descriptors';

export default Ember.Component.extend({
  layout: layout,
  objective: null,
  objectiveDescriptors: function(){
    var objective = this.get('objective');
    if(!objective){
      return [];
    }
    return objective.get('meshDescriptors');
  }.property('objective', 'objective.meshDescriptors.@each'),
  actions: {
    add: function(descriptor){
      var objective = this.get('objective');
      objective.get('meshDescriptors').addObject(descriptor);
    },
    remove: function(descriptor){
      var objective = this.get('objective');
      objective.get('meshDescriptors').removeObject(descriptor);
    }
  }
});
