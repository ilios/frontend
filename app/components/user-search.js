import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, computed } = Ember;
const { notEmpty, oneWay } = computed;

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

export default Component.extend({
  store: Ember.inject.service(),
  classNames: ['user-search'],
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: [],
  placeholder: null,
  roles: '',
  availableInstructorGroups: [],
  currentlyActiveInstructorGroups: [],
  integrateInstructorGroups: notEmpty('availableInstructorGroups'),
  search: task(function * (searchTerms = '') {
    this.set('showMoreInputPrompt', false);
    this.set('searchReturned', false);
    let noWhiteSpaceTerm = searchTerms.replace(/ /g,'');
    if(noWhiteSpaceTerm.length === 0){
      return [];
    } else if(noWhiteSpaceTerm.length < 3){
      this.set('showMoreInputPrompt', true);
      return [];
    }
    let query = {
      q: searchTerms,
      limit: 100
    };
    if (this.get('roles')) {
      query.filters = {
        roles: this.get('roles').split(',')
      };
    }
    let users = yield this.get('store').query('user', query);
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
    this.set('searchReturned', true);
    return results;
  }).restartable(),
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
