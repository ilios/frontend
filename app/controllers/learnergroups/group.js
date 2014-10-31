import Ember from 'ember';

export default Ember.ObjectController.extend({
  breadCrumb: Ember.computed.alias('title'),
  //buffer the title so the input doesn't make the breadcrumb and page title change
  bufferedTitle: '',
  isDirty: false,
  setBufferedTitle: function(){
    this.set('bufferedTitle', this.get('title'));
  }.observes('title'),
  userFilter: '',
  courseFilter: '',
  searchTerms: '',
  showResults: false,
  searchResults: [],
  hasResults: function(){
    return this.get('searchResults').length > 0;
  }.property('searchResults'),
  titleObserver: function(){
    var same = this.get('bufferedTitle') === this.get('model.title');
    this.set('isDirty', !same);
  }.observes('bufferedTitle', 'model.title'),
  filteredUsers: function(){
    var filter = this.get('userFilter');
    var exp = new RegExp(filter, 'gi');
    var learners = this.get('model.users');

    var filtered = learners.filter(function(user) {
      return user.get('fullName').match(exp) || user.get('email').match(exp);
    });
    return filtered.sortBy('lastName', 'firstName');
  }.property('model.users.@each', 'userFilter'),
  filteredCourses: function(){
    var filter = this.get('courseFilter');
    var exp = new RegExp(filter, 'gi');
    var courses = this.get('model.courses');

    var filtered = courses.filter(function(course) {
      return course.get('title').match(exp);
    });
    return filtered.sortBy('title');
  }.property('model.courses.@each', 'courseFilter'),
  showLearnerPicker: false,
  actions: {
    toggleLearnerPickerVisibility: function(){
      this.toggleProperty('showLearnerPicker');
    },
    addLearner: function(user){
      var self = this;
      this.get('model.users').then(function(users){
        users.addObject(user);
        self.set('isDirty', true);
      });
    },
    removeLearner: function(user){
      var self = this;
      this.get('model.users').then(function(users){
        users.removeObject(user);
        self.set('isDirty', true);
      });
    },
    searchLearners: function(){
      var self = this;
      if(this.get('searchTerm').length < 1){
        this.set('showResults', false);
        return;
      }
      this.store.find('user', {searchTerm: this.get('searchTerm')}).then(function(results){
        self.set('searchResults', results.sortBy('lastName', 'firstName'));
        self.set('showResults', true);
      });
    },
    save: function(){
      var self = this;
      var bufferedTitle = this.get('bufferedTitle').trim();
      var learnerGroup = this.get('model');
      learnerGroup.set('title', bufferedTitle);
      learnerGroup.save().then(function(learnerGroup){
        self.set('model', learnerGroup);
        self.set('isDirty', false);
      });
    }
  }
});
