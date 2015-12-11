import Ember from 'ember';

const { Component, computed } = Ember;
const { notEmpty, oneWay } = computed;

export default Component.extend({
  store: Ember.inject.service(),
  classNames: ['user-search'],
  results: [],
  searchTerms: null,
  searching: false,
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: [],
  placeholder: null,
  roles: '',
  availableInstructorGroups: [],
  currentlyActiveInstructorGroups: [],
  currentlySearchingForTerm: false,
  integrateInstructorGroups: notEmpty('availableInstructorGroups'),
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
        isActive: computed('content', 'currentlyActiveUsers.[]', function(){
          let user = this.get('content');
          if(!user.get('enabled')){
            return false;
          }
          return !this.get('currentlyActiveUsers').contains(user);
        }),
        sortTerm: computed('content.firstName', 'content.lastName', function(){
          return this.get('content.lastName')+this.get('content.firstName');
        }),
      });
      let instructorGroupProxy = Ember.ObjectProxy.extend({
        isInstructorGroup: true,
        currentlyActiveInstructorGroups: [],
        isActive: computed('content', 'currentlyActiveInstructorGroups.[]', function(){
          return !this.get('currentlyActiveInstructorGroups').contains(this.get('content'));
        }),
        sortTerm: oneWay('content.title'),
      });
      let query = {
        q: searchTerms,
        limit: 100
      };
      if (this.get('roles')) {
        query.filters = {
          roles: this.get('roles').split(',')
        };
      }
      this.get('store').query('user', query).then(users => {
        let results = users.uniq().map(user => {
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
