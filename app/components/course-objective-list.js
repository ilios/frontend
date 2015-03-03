import Ember from 'ember';

var objectiveProxy = Ember.ObjectProxy.extend({
  variableTitle: function(){
    var obj = this.get('content');
    if(!obj.get('hasParents')){
      return '';
    }
    if(obj.get('multipleParents')){
      return obj.get('parents.length');
    } else {
      var firstParent = obj.get('parents.firstObject');
      var str = firstParent.get('textTitle');
      if(firstParent.get('competency')){
        str += '(' + firstParent.get('competency.title') + ')';
      }
      return str;
    }
  }.property('content.hasParents', 'content.multipleParents', 'parents.@each.textTitle')
});

export default Ember.Component.extend({
  course: null,
  objectives: Ember.computed.alias('course.objectives'),
  objectiveProxies: function(){
    var objectives = this.get('objectives');
    if(!objectives){
      return [];
    }
    return objectives.map(function(objective){
      return objectiveProxy.create({
        content: objective,
      });
    }).sortBy('id');
  }.property('objectives.@each'),
  actions: {
    manageParents: function(objective){
      this.sendAction('manageParents', objective.get('content'));
    }
  }
});
