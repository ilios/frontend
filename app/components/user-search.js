import Ember from 'ember';

export default Ember.Component.extend({
  results: [],
  searchTerms: null,
  searching: false,
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: [],
  sortBy: ['lastName', 'firstName'],
  sortedSearchResults: Ember.computed.sort('results', 'sortBy'),
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  debouncedSearchTerms: '',
  watchTerms: function(){
    Ember.run.debounce(this, this.setDebouncedTerms, 500);
  }.observes('searchTerms'),
  setDebouncedTerms: function(){
    this.set('debouncedSearchTerms', this.get('searchTerms'));
  },
  searchForUsers: function(){
    var self = this;
    var searchTerms = this.get('searchTerms');
    if(searchTerms.replace(/ /g,'').length < 3){
      this.set('showMoreInputPrompt', true);
    } else {
      this.set('showMoreInputPrompt', false);
      this.set('searchReturned', false);
      this.set('results', []);
      var userProxy = Ember.ObjectProxy.extend({
        currentlyActiveUsers: null,
        isActive: function(){
          return !this.get('currentlyActiveUsers').contains(this.get('content'));
        }.property('content', 'currentlyActiveUsers.@each')
      });
      this.set('searching', true);
      this.store.find('user', {searchTerm: searchTerms}).then(function(users){
        var results = users.map(function(user){
          return userProxy.create({
            content: user,
            currentlyActiveUsers: self.get('currentlyActiveUsers'),
          });
        });
        self.set('searching', false);
        self.set('searchReturned', true);
        self.set('results', results);
      });
    }

  }.observes('debouncedSearchTerms'),
  actions: {
    addUser: function(user){
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      if(!this.get('currentlyActiveUsers').contains(user)){
        this.sendAction('addUser', user.get('content'));
      }
    }
  }
});
