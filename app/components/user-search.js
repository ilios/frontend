/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

const { oneWay } = computed;

let userProxy = ObjectProxy.extend({
  isUser: true,
  currentlyActiveUsers: null,
  isActive: computed('content', 'currentlyActiveUsers.[]', function(){
    let user = this.content;
    if(!user.get('enabled')){
      return false;
    }
    return !this.currentlyActiveUsers.includes(user);
  }),
  sortTerm: oneWay('content.fullName'),
});
let instructorGroupProxy = ObjectProxy.extend({
  isInstructorGroup: true,
  currentlyActiveInstructorGroups: null,
  isActive: computed('content', 'currentlyActiveInstructorGroups.[]', function(){
    return !this.currentlyActiveInstructorGroups.includes(this.content);
  }),
  sortTerm: oneWay('content.title'),
});

export default Component.extend({
  store: service(),
  i18n: service(),
  classNames: ['user-search'],
  'data-test-user-search': true,
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: null,
  placeholder: null,
  roles: '',
  availableInstructorGroups: null,
  currentlyActiveInstructorGroups: null,
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
    if (this.roles) {
      query.filters = {
        roles: this.roles.split(',')
      };
    }
    let users = yield this.store.query('user', query);
    const currentlyActiveUsers = this.currentlyActiveUsers === null?[]:this.currentlyActiveUsers;
    let results = users.map(user => {
      return userProxy.create({
        content: user,
        currentlyActiveUsers,
      });
    });

    let availableInstructorGroups = yield this.availableInstructorGroups;
    if(! isEmpty(availableInstructorGroups)){
      let exp = new RegExp(searchTerms, 'gi');

      let filteredGroups = availableInstructorGroups.filter(group => {
        return group.get('title') && group.get('title').match(exp);
      });
      const currentlyActiveInstructorGroups = isEmpty(this.currentlyActiveInstructorGroups)?[]:this.currentlyActiveInstructorGroups;
      let instructorGroupProxies = filteredGroups.map(group => {
        return instructorGroupProxy.create({
          content: group,
          currentlyActiveInstructorGroups,
        });
      });

      results.pushObjects(instructorGroupProxies);
    }
    const i18n = this.i18n;
    const locale = i18n.get('locale');
    results.sort((a, b) => {
      const sortTermA = a.get('sortTerm');
      const sortTermB = b.get('sortTerm');

      return sortTermA.localeCompare(sortTermB, locale, { numeric: true });
    });
    this.set('searchReturned', true);
    return results;
  }).restartable(),
  actions: {
    addUser(user) {
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      const currentlyActiveUsers = isEmpty(this.currentlyActiveUsers)?[]:this.currentlyActiveUsers;
      if(!currentlyActiveUsers.includes(user)){
        this.sendAction('addUser', user);
      }
    },
    addInstructorGroup(group) {
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      const currentlyActiveInstructorGroups = isEmpty(this.currentlyActiveInstructorGroups)?[]:this.currentlyActiveInstructorGroups;
      if(!currentlyActiveInstructorGroups.includes(group)){
        this.sendAction('addInstructorGroup', group);
      }
    }
  }
});
