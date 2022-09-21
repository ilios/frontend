import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import escapeRegExp from '../utils/escape-reg-exp';
import { dropTask } from 'ember-concurrency';
import { sortBy } from '../utils/array-helpers';

export default class SessionsGrid extends Component {
  @service router;
  @service preserveScroll;
  @tracked confirmDeleteSessionIds = [];

  get filteredSessions() {
    if (isEmpty(this.args.sessions)) {
      return [];
    }
    if (isEmpty(this.args.filterBy)) {
      return this.args.sessions;
    }

    const filterExpressions = this.args.filterBy.split(' ').map(function (string) {
      const clean = escapeRegExp(string);
      return new RegExp(clean, 'gi');
    });

    return this.args.sessions.filter((session) => {
      let matchedSearchTerms = 0;

      for (let i = 0; i < filterExpressions.length; i++) {
        if (session.searchString.match(filterExpressions[i])) {
          matchedSearchTerms++;
        }
      }
      //if the number of matching search terms is equal to the number searched, return true
      return matchedSearchTerms === filterExpressions.length;
    });
  }

  get sortedSessions() {
    if (this.sortInfo.descending) {
      return sortBy(this.filteredSessions, this.sortInfo.column).reverse();
    }
    return sortBy(this.filteredSessions, this.sortInfo.column);
  }

  get sortInfo() {
    const parts = this.args.sortBy.split(':');
    const column = parts[0];
    const descending = parts.length > 1 && parts[1] === 'desc';

    return { column, descending, sortBy: this.args.sortBy };
  }

  @action
  scrollDown() {
    const position = this.preserveScroll.getPosition('session-list');
    next(() => {
      if (position) {
        window.scroll(0, position);
      }
    });
  }

  @action
  confirmDelete(sessionId) {
    this.confirmDeleteSessionIds = [...this.confirmDeleteSessionIds, sessionId];
  }

  @action
  cancelDelete(sessionId) {
    this.confirmDeleteSessionIds = this.confirmDeleteSessionIds.filter((id) => id !== sessionId);
  }

  @action
  expandSession(sessionObject) {
    if (sessionObject.offeringCount) {
      this.args.expandSession(sessionObject.session);
    }
  }

  removeSession = dropTask(async (session) => {
    session.deleteRecord();
    await session.save();
  });
}
