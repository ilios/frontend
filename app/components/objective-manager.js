import Ember from 'ember';

export default Ember.Component.extend({
  objective: null,
  objectiveGroups: [],
  selectedGroup: null,
  multipleParents: false,
  allObjectives: function(){
    var objectives = [];
    this.get('objectiveGroups').forEach(function(group){
      group.get('objectives').forEach(function(obj){
        objectives.pushObject(obj);
      });
    });
    return objectives;
  }.property('objectiveGroups.@each'),
  currentObjectiveGroup: function(){
    var group = this.get('selectedGroup');
    if(group == null){
      group = this.get('objectiveGroups').get('firstObject');
    }
    if(group !== undefined){
      return group;
    }
    return null;
  }.property('selectedGroup', 'objectiveGroups.@each'),
  actions: {
    selectParent: function(parentObj){
      var objective = this.get('objective');
      var parent = parentObj.get('content');
      if(!this.get('multipleParents')){
        this.get('allObjectives').filter(function(obj){
          return obj.get('id') !== parent.get('id');
        }).setEach('selected', false);
        parentObj.set('selected', true);
        objective.get('parents').then(function(parents){
          parent.get('children').then(function(children){
            parents.clear();
            parents.addObject(objective);
            children.addObject(parent);
            objective.save();
            parent.save();
          });
        });
      }
    }
  }
});
