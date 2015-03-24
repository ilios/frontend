import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  group: null,
  bufferedTitle: Ember.computed.oneWay('group.title'),
  isDirty: false,
  resolvedCourses: Ember.A(),
  userSearchResults: [],
  titleObserver: function(){
    var same = this.get('bufferedTitle') === this.get('group.title');
    this.set('isDirty', !same);
  }.observes('bufferedTitle', 'group.title'),
  coursesObserver: function(){
    var self = this;
    var courses = this.get('group.courses');
    if(courses){
      courses.then(function(courses){
        self.set('resolvedCourses', courses);
      });
    }
  }.observes('group.courses').on('init'),
  replaceSearchResults: function(){
    var self = this;
    var exp = new RegExp(this.get('userSearchTerms'), 'gi');
    this.get('group.availableUsers').then(function(users){
      var filtered = users.filter(function(user) {
        return user.get('fullName').match(exp) || user.get('email').match(exp);
      });
      self.set('userSearchResults', filtered.sortBy('lastName', 'firstName'));
    });
  }.observes('userSearchTerms', 'group.availableUsers.@each'),
  actions: {
    addLearner: function(user){
      var self = this;
      this.get('group.users').then(function(users){
        users.addObject(user);
        self.set('isDirty', true);
      });
    },
    removeLearner: function(user){
      var self = this;
      this.get('group.users').then(function(users){
        users.removeObject(user);
        self.set('isDirty', true);
      });
      this.get('group.children').then(function(children){
        children.forEach(function(child){
          child.get('users').then(function(users){
            users.removeObject(user);
          });
        });
      });
    },
    createNewChildGroup: function(){
      var self = this;
      var promises = {
        'cohort': this.get('cohort'),
        'parent': this.get('parent')
      };
      Ember.RSVP.hash(promises).then(function(hash){
        var learnerGroup = self.get('store').createRecord('learner-group', {
          title: null,
          cohort: hash.cohort,
          parent: hash.parent,
        });
        self.get('group.children').pushObject(learnerGroup);
      });
    },
    save: function(){
      var self = this;
      var bufferedTitle = this.get('bufferedTitle').trim();
      var learnerGroup = this.get('group');
      learnerGroup.set('title', bufferedTitle);
      learnerGroup.save().then(function(learnerGroup){
        if(!self.get('isDestroyed')){
          self.set('group', learnerGroup);
          self.set('isDirty', false);
        }
      });
    },
    searchUsers: function(searchTerms){
      this.set('userSearchTerms', searchTerms);
    },
    remove: function(){
      var group = this.get('group');
      group.destroyChildren().then(function(){
        group.destroyRecord();
      });
    }
  }

});
