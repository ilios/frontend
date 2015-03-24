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
    var courses = this.get('group.courses');
    this.set('resolvedCourses', courses);
  }.observes('group.courses').on('init'),
  replaceSearchResults: function(){
    var self = this;
    this.get('store').find('user', {searchTerm: this.get('userSearchTerms')}).then(function(users){
      self.set('userSearchResults', users.sortBy('lastName', 'firstName'));
    });
  }.observes('userSearchTerms'),
  actions: {
    addInstructor: function(user){
      var self = this;
      this.get('group.users').then(function(users){
        users.addObject(user);
        self.set('isDirty', true);
      });
    },
    removeInstructor: function(user){
      var self = this;
      this.get('group.users').then(function(users){
        users.removeObject(user);
        self.set('isDirty', true);
      });
    },
    save: function(){
      var self = this;
      var bufferedTitle = this.get('bufferedTitle').trim();
      var instructorGropu = this.get('group');
      instructorGropu.set('title', bufferedTitle);
      instructorGropu.save().then(function(instructorGropu){
        if(!self.get('isDestroyed')){
          self.set('group', instructorGropu);
          self.set('isDirty', false);
        }
      });
    },
    searchUsers: function(searchTerms){
      this.set('userSearchTerms', searchTerms);
    },
    remove: function(){
      var group = this.get('group');
      group.destroyRecord();
    }
  }

});
