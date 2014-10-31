import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'learnerGroups.list',
  promptTranslation: 'learnerGroups.selectCohort',
  showCohortPicker: true,
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
  arrangedAvailableCohorts: [],
  availableCohortsObserver: function(){
    var self = this;
    this.get('currentUser.availableCohorts').then(function(availableCohorts){
      var sorted = availableCohorts.sort(function(a,b){
        return Ember.compare(a.get('displayTitle'),b.get('displayTitle'));
      });
      self.set('arrangedAvailableCohorts', sorted);
    });
  }.observes('currentUser.availableCohorts'),
  currentCohortObserver: function(){
    var self = this;
    var currentCohort = this.get('currentUser.currentCohort');
    if(currentCohort){
      currentCohort.get('topLevelLearnerGroups').then(function(groups){
        self.set('model', groups);
      });
    } else {
      self.set('model', []);
    }
  }.observes('currentUser.currentCohort', 'currentUser.currentCohort.topLevelLearnerGroups.@each'),
  actions: {
    createNewGroup: function(){
      var self = this;
      var learnerGroup = self.store.createRecord('learner-group', {
        title: null,
        cohort: this.get('currentUser.currentCohort'),
      });
      this.get('model').pushObject(learnerGroup);
    }
  }
});
