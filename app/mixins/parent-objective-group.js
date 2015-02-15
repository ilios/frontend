import Ember from 'ember';

export default Ember.Mixin.create({
  title: '',
  id: null,
  objectives: [],
  objectivesByCompetency: [],
  watchObjectives: function(){
    var self = this;
    var competencyGroup = Ember.Object.extend({
      title: '',
      originalObjectives: [],
      uniqueObjectives: Ember.computed.uniq('originalObjectives'),
      objectiveSorting: ['title'],
      objectives: Ember.computed.sort('uniqueObjectives', 'objectiveSorting'),
      selectedObjectives: Ember.computed.filterBy('uniqueObjectives', 'selected', true),
      selected: Ember.computed.gt('selectedObjectives.length', 0),
    });
    var promises = this.get('objectives').mapBy('competency');
    Ember.RSVP.hash(promises).then(function(hash){
      var competencies = [];
      for(var i in hash){
        competencies.pushObject(hash[i]);
      }
      var groups = competencies.uniq().map(function(competency){
        var objectives = self.get('objectives').filter(function(objective){
          return objective.get('competency').get('id') === competency.get('id');
        });
        return competencyGroup.create({
          title: competency.get('title'),
          originalObjectives: objectives
        });
      });
      self.set('objectivesByCompetency', groups.sortBy('title'));
    });
  }.observes('objectives.@each.competency').on('init')
});
