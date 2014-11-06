import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  needs: ['learnergroupscohort'],
  currentCohort: Ember.computed.alias("controllers.learnergroupscohort.model"),
  breadCrumbTranslation: 'learnerGroups.list',
  sortAscending: true,
  filter: '',
  sortProperties: ['title'],
  sortFunction: function(a,b){
    if(a == null){
      return 1;
    }
    if(b == null){
      return -1;
    }
    return Ember.compare(a,b);
  },
  filteredContent: function(){
    var filter = this.get('filter');
    var exp = new RegExp(filter, 'gi');
    var groups = this.get('arrangedContent');
    if(groups == null){
      return Ember.A();
    }
    return groups.filter(function(group) {
      if(group.get('title') === null){
        return true;
      }
      return group.get('title').match(exp);
    });

  }.property('arrangedContent.@each', 'filter'),
  currentCohortObserver: function(){
    var self = this;
    this.get('currentCohort.topLevelLearnerGroups').then(function(groups){
      self.set('model', groups);
    });
  }.observes('currentCohort.learnerGroups.@each'),
  actions: {
    createNewGroup: function(){
      var self = this;
      var learnerGroup = self.store.createRecord('learner-group', {
        title: null,
        cohort: this.get('currentCohort'),
      });
      this.get('model').pushObject(learnerGroup);
    }
  }
});
