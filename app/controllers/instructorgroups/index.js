import Ember from 'ember';

export default Ember.ArrayController.extend({
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
  currentSchoolObserver: function(){
    var self = this;
    this.get('currentUser.currentSchool.instructorGroups').then(function(groups){
      self.set('model', groups);
    });
  }.observes('currentUser.currentSchool'),
  actions: {
    createNewGroup: function(){
      var instructorGroup = this.store.createRecord('instructor-group', {
        title: null,
        school: this.get('currentUser.currentSchool'),
      });
      this.get('model').pushObject(instructorGroup);
    }
  }
});
