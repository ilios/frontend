import Ember from 'ember';

export default Ember.ObjectController.extend({
  isDirty: false,
  comptencySearchResults: [],
  objectiveSearchResults: [],
  actions:{
    removeCompetency: function(competency){
      this.get('competencies').removeObject(competency);
      this.set('isDirty', true);
    },
    removeObjective: function(objective){
      this.get('objectives').removeObject(objective);
      this.set('isDirty', true);
    },
    removeDirector: function(director){
      this.get('directors').removeObject(director);
      this.set('isDirty', true);
    },
    findCompetency: function(searchTerm){
      var self = this;
      this.store.find('competency', {searchTerm: searchTerm}).then(function(results){
        var filtered = results.filter(function(result){
          var exists = false;
          self.get('competencies').forEach(function(competency){
            if(competency.get('id') === result.get('id')){
              exists = true;
            }
          });
          return !exists;
        });
        self.set('comptencySearchResults', filtered);
      });
    },
    addCompetency: function(competency){
      this.get('comptencySearchResults').removeObject(competency);
      this.get('competencies').addObject(competency);
      this.set('isDirty', true);
    },
    findObjective: function(searchTerm){
      var self = this;
      this.store.find('objective', {searchTerm: searchTerm}).then(function(results){
        var filtered = results.filter(function(result){
          var exists = false;
          self.get('objectives').forEach(function(objective){
            if(objective.get('id') === result.get('id')){
              exists = true;
            }
          });
          return !exists;
        });
        self.set('objectiveSearchResults', filtered);
      });
    },
    addObjective: function(objective){
      this.get('objectiveSearchResults').removeObject(objective);
      this.get('objectives').addObject(objective);
      this.set('isDirty', true);
    },
    findDirector: function(searchTerm){
      var self = this;
      this.store.find('user', {searchTerm: searchTerm}).then(function(results){
        var filtered = results.filter(function(result){
          var exists = false;
          self.get('directors').forEach(function(user){
            if(user.get('id') === result.get('id')){
              exists = true;
            }
          });
          return !exists;
        });
        self.set('directorSearchResults', filtered);
      });
    },
    addDirector: function(director){
      this.get('directorSearchResults').removeObject(director);
      this.get('directors').addObject(director);
      this.set('isDirty', true);
    },
    save: function(){
      var self = this;
      this.get('model').save().then(function(){
        self.set('isDirty', false);
      });
    }
  }
});
