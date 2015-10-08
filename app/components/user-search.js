import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  results: [],
  searchTerms: null,
  searching: false,
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: [],
  placeholder: null,
  availableInstructorGroups: [],
  currentlyActiveInstructorGroups: [],
  currentlySearchingForTerm: false,
  integrateInstructorGroups: Ember.computed.notEmpty('availableInstructorGroups'),
  actions: {
    search: function(searchTerms){
      if(this.get('currentlySearchingForTerm') === searchTerms){
        return;
      }
      this.set('currentlySearchingForTerm', searchTerms);
      this.set('showMoreInputPrompt', false);
      this.set('searchReturned', false);
      let noWhiteSpaceTerm = searchTerms.replace(/ /g,'');
      if(noWhiteSpaceTerm.length === 0){
        this.set('results', []);
        this.set('searching', false);
        return;
      } else if(noWhiteSpaceTerm.length < 3){
        this.set('results', []);
        this.set('showMoreInputPrompt', true);
        return;
      }
      this.set('searching', true);
      let userProxy = Ember.ObjectProxy.extend({
        isUser: true,
        currentlyActiveUsers: [],
        isActive: function(){
          let user = this.get('content');
          if(!user.get('enabled')){
            return false;
          }
          return !this.get('currentlyActiveUsers').contains(user);
        }.property('content', 'currentlyActiveUsers.@each'),
        sortTerm: Ember.computed('content.firstName', 'content.lastName', function(){
          return this.get('content.lastName')+this.get('content.firstName');
        }),
      });
      let instructorGroupProxy = Ember.ObjectProxy.extend({
        isInstructorGroup: true,
        currentlyActiveInstructorGroups: [],
        isActive: function(){
          return !this.get('currentlyActiveInstructorGroups').contains(this.get('content'));
        }.property('content', 'currentlyActiveInstructorGroups.@each'),
        sortTerm: Ember.computed.oneWay('content.title'),
      });
      this.get('store').query('user', {q: searchTerms}).then(users => {
        let results = users.map(user => {
          return userProxy.create({
            content: user,
            currentlyActiveUsers: this.get('currentlyActiveUsers'),
          });
        });

        if(this.get('integrateInstructorGroups')){
          let exp = new RegExp(searchTerms, 'gi');

          let filteredGroups = this.get('availableInstructorGroups').filter(group => {
            return group.get('title') && group.get('title').match(exp);
          });
          let instructorGroupProxies = filteredGroups.map(group => {
            return instructorGroupProxy.create({
              content: group,
              currentlyActiveInstructorGroups: this.get('currentlyActiveInstructorGroups'),
            });
          });

          results.pushObjects(instructorGroupProxies);
          results.sortBy('sortTerm');
        }

        this.set('results', results);
        this.set('searching', false);
        this.set('searchReturned', true);
      });
    },
    addUser: function(user){
      this.set('searchTerms', '');
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      if(!this.get('currentlyActiveUsers').contains(user)){
        this.sendAction('addUser', user);
      }
    },
    addInstructorGroup: function(group){
      this.set('searchTerms', '');
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      if(!this.get('currentlyActiveInstructorGroups').contains(group)){
        this.sendAction('addInstructorGroup', group);
      }
    }
  }
});
