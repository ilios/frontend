import { inject as service } from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
const { oneWay } = computed;
import {tracked} from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from "ember-concurrency-decorators";

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

export default class UserSearch extends Component {
  @service store;
  @service intl;
  @tracked showMoreInputPrompt = false;
  @tracked searchReturned = false;
  @tracked currentlyActiveUsers;
  @tracked currentlyActiveInstructorGroups;
  @tracked loaded = false;

  get roles() {
    return this.args.roles || '';
  }

  @action
  addUser(user) {
    //don't send actions to the calling component if the user is already in the list
    //prevents a complicated if/else on the template.
    if(! this.currentlyActiveUsers.includes(user)){
      if (this.args.addUser) {
        this.args.addUser(user);
      }
    }
  }

  @action
  load(element, [currentlyActiveUsers, currentlyActiveInstructorGroups]) {
    this.loaded = false;
    if (currentlyActiveUsers) {
      this.currentlyActiveUsers = currentlyActiveUsers;
    } else {
      this.currentlyActiveUsers = [];
    }

    if (currentlyActiveInstructorGroups) {
      this.currentlyActiveInstructorGroups = currentlyActiveInstructorGroups;
    } else {
      this.currentlyActiveInstructorGroups = [];
    }
  }

  @action
  addInstructorGroup(group) {
    //don't send actions to the calling component if the user is already in the list
    //prevents a complicated if/else on the template.
    if(! this.currentlyActiveInstructorGroups.includes(group)){
      if (this.args.addInstructorGroup) {
        this.args.addInstructorGroup(group);
      }
    }
  }

  @restartableTask
  *search(searchTerms) {
    this.showMoreInputPrompt = false;
    this.searchReturned = false;
    const noWhiteSpaceTerm = searchTerms.replace(/ /g,'');
    if(noWhiteSpaceTerm.length === 0){
      return [];
    } else if(noWhiteSpaceTerm.length < 3){
      this.showMoreInputPrompt = true;
      return [];
    }
    const query = {
      q: searchTerms,
      limit: 100
    };
    if (this.roles) {
      query.filters = {
        roles: this.roles.split(',')
      };
    }
    const users = yield this.store.query('user', query);
    const results = users.map(user => {
      return userProxy.create({
        content: user,
        currentlyActiveUsers: this.currentlyActiveUsers,
      });
    });

    const availableInstructorGroups = yield this.args.availableInstructorGroups;
    if (! isEmpty(availableInstructorGroups)){
      const fragment = searchTerms.toLowerCase().trim();

      const filteredGroups = availableInstructorGroups.filter(group => {
        return group.get('title') && group.get('title').toLowerCase().includes(fragment);
      });

      const instructorGroupProxies = filteredGroups.map(group => {
        return instructorGroupProxy.create({
          content: group,
          currentlyActiveInstructorGroups: this.currentlyActiveInstructorGroups,
        });
      });

      results.pushObjects(instructorGroupProxies);
    }
    const locale = this.intl.get('locale');
    results.sort((a, b) => {
      const sortTermA = a.get('sortTerm');
      const sortTermB = b.get('sortTerm');

      return sortTermA.localeCompare(sortTermB, locale, { numeric: true });
    });
    this.searchReturned = true;
    return results;
  }
}
