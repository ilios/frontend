import { inject as service } from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
const { oneWay } = computed;

const userProxy = ObjectProxy.extend({
  isUser: true,
  currentlyActiveUsers: null,
  sortTerm: oneWay('content.fullName'),
  isActive: computed('content', 'currentlyActiveUsers.[]', function(){
    const user = this.get('content');
    if(!user.get('enabled')){
      return false;
    }
    return !this.get('currentlyActiveUsers').includes(user);
  }),
});
const instructorGroupProxy = ObjectProxy.extend({
  isInstructorGroup: true,
  currentlyActiveInstructorGroups: null,
  sortTerm: oneWay('content.title'),
  isActive: computed('content', 'currentlyActiveInstructorGroups.[]', function(){
    return !this.get('currentlyActiveInstructorGroups').includes(this.get('content'));
  }),
});

export default Component.extend({
  store: service(),
  intl: service(),
  classNames: ['user-search'],
  'data-test-user-search': true,
  showMoreInputPrompt: false,
  searchReturned: false,
  currentlyActiveUsers: null,
  placeholder: null,
  roles: '',
  availableInstructorGroups: null,
  currentlyActiveInstructorGroups: null,
  actions: {
    addUser(user) {
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      const currentlyActiveUsers = isEmpty(this.get('currentlyActiveUsers'))?[]:this.get('currentlyActiveUsers');
      if(!currentlyActiveUsers.includes(user)){
        this.addUser(user);
      }
    },
    addInstructorGroup(group) {
      //don't send actions to the calling component if the user is already in the list
      //prevents a complicated if/else on the template.
      const currentlyActiveInstructorGroups = isEmpty(this.get('currentlyActiveInstructorGroups'))?[]:this.get('currentlyActiveInstructorGroups');
      if(!currentlyActiveInstructorGroups.includes(group)){
        if (this.addInstructorGroup) {
          this.addInstructorGroup(group);
        }
      }
    }
  },
  search: task(function * (searchTerms = '') {
    this.set('showMoreInputPrompt', false);
    this.set('searchReturned', false);
    const noWhiteSpaceTerm = searchTerms.replace(/ /g,'');
    if(noWhiteSpaceTerm.length === 0){
      return [];
    } else if(noWhiteSpaceTerm.length < 3){
      this.set('showMoreInputPrompt', true);
      return [];
    }
    const query = {
      q: searchTerms,
      limit: 100
    };
    if (this.get('roles')) {
      query.filters = {
        roles: this.get('roles').split(',')
      };
    }
    const users = yield this.get('store').query('user', query);
    const currentlyActiveUsers = this.get('currentlyActiveUsers') === null?[]:this.get('currentlyActiveUsers');
    const results = users.map(user => {
      return userProxy.create({
        content: user,
        currentlyActiveUsers,
      });
    });

    const availableInstructorGroups = yield this.get('availableInstructorGroups');
    if(! isEmpty(availableInstructorGroups)){
      const fragment = searchTerms.toLowerCase().trim();

      const filteredGroups = availableInstructorGroups.filter(group => {
        return group.get('title') && group.get('title').toLowerCase().includes(fragment);
      });
      const currentlyActiveInstructorGroups = isEmpty(this.get('currentlyActiveInstructorGroups'))?[]:this.get('currentlyActiveInstructorGroups');
      const instructorGroupProxies = filteredGroups.map(group => {
        return instructorGroupProxy.create({
          content: group,
          currentlyActiveInstructorGroups,
        });
      });

      results.pushObjects(instructorGroupProxies);
    }
    const intl = this.get('intl');
    const locale = intl.get('locale');
    results.sort((a, b) => {
      const sortTermA = a.get('sortTerm');
      const sortTermB = b.get('sortTerm');

      return sortTermA.localeCompare(sortTermB, locale, { numeric: true });
    });
    this.set('searchReturned', true);
    return results;
  }).restartable(),
});
