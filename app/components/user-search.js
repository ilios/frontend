import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  results: [],
  searchTerms: null,
  searching: false,
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: [],
  sortBy: ['lastName', 'firstName'],
  sortedSearchResults: Ember.computed.sort('results', 'sortBy'),
  placeholder: null,
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  debouncedSearchTerms: '',
  availableInstructorGroups: [],
  currentlyActiveInstructorGroups: [],
  integrateInstructorGroups: Ember.computed.notEmpty('availableInstructorGroups'),
  watchTerms: function(){
    //send clear events immediatly
    if(this.get('searchTerms').length === 0){
      this.set('debouncedSearchTerms', this.get('searchTerms'));
    }
    Ember.run.debounce(this, this.setDebouncedTerms, 500);
  }.observes('searchTerms'),
  setDebouncedTerms: function(){
    this.set('debouncedSearchTerms', this.get('searchTerms'));
  },
  searchForUsers: function(){
    var self = this;
    var searchTerms = this.get('searchTerms');
    var noWhiteSpaceTerm = searchTerms.replace(/ /g,'');
    this.set('showMoreInputPrompt', false);
    this.set('searchReturned', false);
    this.set('results', []);
    if(noWhiteSpaceTerm.length === 0){
      return;
    } else if(noWhiteSpaceTerm.length < 3){
      this.set('showMoreInputPrompt', true);
    } else {
      var userProxy = Ember.ObjectProxy.extend({
        isUser: true,
        currentlyActiveUsers: [],
        isActive: function(){
          return !this.get('currentlyActiveUsers').contains(this.get('content'));
        }.property('content', 'currentlyActiveUsers.@each'),
        sortTerm: Ember.computed('content.firstName', 'content.lastName', function(){
          return this.get('content.lastName')+this.get('content.firstName');
        }),
      });
      var instructorGroupProxy = Ember.ObjectProxy.extend({
        isInstructorGroup: true,
        currentlyActiveInstructorGroups: [],
        isActive: function(){
          return !this.get('currentlyActiveInstructorGroups').contains(this.get('content'));
        }.property('content', 'currentlyActiveInstructorGroups.@each'),
        sortTerm: Ember.computed.oneWay('content.title'),
      });
      this.set('searching', true);
      this.get('store').find('user', {q: searchTerms}).then(function(users){
        var results = users.map(function(user){
          return userProxy.create({
            content: user,
            currentlyActiveUsers: self.get('currentlyActiveUsers'),
          });
        });

        if(self.get('integrateInstructorGroups')){
          var exp = new RegExp(searchTerms, 'gi');

          let filteredGroups = self.get('availableInstructorGroups').filter(group => {
            return group.get('title').match(exp);
          });
          let instructorGroupProxies = filteredGroups.map(group => {
            return instructorGroupProxy.create({
              content: group,
              currentlyActiveInstructorGroups: self.get('currentlyActiveInstructorGroups'),
            });
          });

          results.pushObjects(instructorGroupProxies);
          results.sortBy('sortTerm');
        }
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
        this.sendAction('addUser', user);
      }
    },
    addInstructorGroup: function(group){
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      if(!this.get('currentlyActiveInstructorGroups').contains(group)){
        this.sendAction('addInstructorGroup', group);
      }
    }
  }
});
