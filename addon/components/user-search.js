import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';

export default class UserSearch extends Component {
  @service store;
  @service intl;
  @tracked showMoreInputPrompt = false;
  @tracked searchReturned = false;
  @tracked userResults = [];
  @tracked instructorGroupResults = [];

  get currentlyActiveInstructorGroups() {
    return this.args.currentlyActiveInstructorGroups || [];
  }

  get currentlyActiveUsers() {
    return this.args.currentlyActiveUsers || [];
  }

  get availableInstructorGroups() {
    return this.args.availableInstructorGroups || [];
  }

  get sortedResults() {
    const results = [...this.userResults, ...this.instructorGroupResults];
    const locale = this.intl.get('locale');
    results.sort((a, b) => {
      return a.sortTerm.localeCompare(b.sortTerm, locale, { numeric: true });
    });
    return results;
  }

  get roles() {
    return this.args.roles || '';
  }

  @action
  addUser(user) {
    if (this.args.addUser) {
      this.args.addUser(user);
    }
  }

  @action
  addInstructorGroup(group) {
    if (this.args.addInstructorGroup) {
      this.args.addInstructorGroup(group);
    }
  }

  search = restartableTask(async (searchTerms = '') => {
    this.showMoreInputPrompt = false;
    this.searchReturned = false;
    this.userResults = [];
    this.instructorGroupResults = [];
    const noWhiteSpaceTerm = searchTerms.replace(/ /g, '');
    if (noWhiteSpaceTerm.length === 0) {
      return;
    } else if (noWhiteSpaceTerm.length < 3) {
      this.showMoreInputPrompt = true;
      return;
    }
    this.userResults = await this.searchUsers(searchTerms);
    this.instructorGroupResults = this.searchInstructorGroups(searchTerms);
    this.searchReturned = true;
  });

  searchInstructorGroups(searchTerms) {
    const fragment = searchTerms.toLowerCase().trim();
    const filteredGroups = this.availableInstructorGroups.filter((group) => {
      return group.title?.toLowerCase().includes(fragment);
    });

    return filteredGroups.map((group) => {
      return { group, type: 'group', sortTerm: group.title };
    });
  }

  async searchUsers(searchTerms) {
    const query = {
      q: searchTerms,
      limit: 100,
    };
    if (this.roles) {
      query.filters = {
        roles: this.roles.split(','),
      };
    }
    const users = await this.store.query('user', query);
    return users.map((user) => {
      return { user, type: 'user', sortTerm: user.fullName };
    });
  }
}
