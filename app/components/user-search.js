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
    let user = this.get('content');
    if(!user.get('enabled')){
      return false;
    }
    return !this.get('currentlyActiveUsers').includes(user);
  }),
  sortTerm: computed('content.firstName', 'content.lastName', function(){
    return this.get('content.lastName')+this.get('content.firstName');
  }),
});
let instructorGroupProxy = ObjectProxy.extend({
  isInstructorGroup: true,
  currentlyActiveInstructorGroups: null,
  isActive: computed('content', 'currentlyActiveInstructorGroups.[]', function(){
    return !this.get('currentlyActiveInstructorGroups').includes(this.get('content'));
  }),
  sortTerm: oneWay('content.title'),
});

export default Component.extend({
  store: service(),
  i18n: service(),
  classNames: ['user-search'],
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
    if (this.get('roles')) {
      query.filters = {
        roles: this.get('roles').split(',')
      };
    }
    let users = yield this.get('store').query('user', query);
    const currentlyActiveUsers = this.get('currentlyActiveUsers') === null?[]:this.get('currentlyActiveUsers');
    let results = users.map(user => {
      return userProxy.create({
        content: user,
        currentlyActiveUsers,
        sortTerm: oneWay('content.fullName'),
      });
    });

    let availableInstructorGroups = yield this.get('availableInstructorGroups');
    if(! isEmpty(availableInstructorGroups)){
      let exp = new RegExp(searchTerms, 'gi');

      let filteredGroups = availableInstructorGroups.filter(group => {
        return group.get('title') && group.get('title').match(exp);
      });
      const currentlyActiveInstructorGroups = isEmpty(this.get('currentlyActiveInstructorGroups'))?[]:this.get('currentlyActiveInstructorGroups');
      let instructorGroupProxies = filteredGroups.map(group => {
        return instructorGroupProxy.create({
          content: group,
          currentlyActiveInstructorGroups,
        });
      });

      results.pushObjects(instructorGroupProxies);
    }
    const i18n = this.get('i18n');
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
      const currentlyActiveUsers = isEmpty(this.get('currentlyActiveUsers'))?[]:this.get('currentlyActiveUsers');
      if(!currentlyActiveUsers.includes(user)){
        this.sendAction('addUser', user);
      }
    },
    addInstructorGroup(group) {
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      const currentlyActiveInstructorGroups = isEmpty(this.get('currentlyActiveInstructorGroups'))?[]:this.get('currentlyActiveInstructorGroups');
      if(!currentlyActiveInstructorGroups.includes(group)){
        this.sendAction('addInstructorGroup', group);
      }
    }
  }
});
