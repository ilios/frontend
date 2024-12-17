import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { next } from '@ember/runloop';
import { dropTask } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { filter, map } from 'rsvp';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionsGrid extends Component {
  @service router;
  @service preserveScroll;
  @service intl;
  @tracked confirmDeleteSessionIds = [];

  constructor() {
    super(...arguments);
    this.scrollDown();
  }

  @cached
  get sortedSessionsData() {
    return new TrackedAsyncData(
      this.sortSessions(this.args.sessions, this.args.filterBy, this.sortInfo),
    );
  }

  get sortedSessions() {
    return this.sortedSessionsData.isResolved ? this.sortedSessionsData.value : [];
  }

  async sortSessions(sessions, filterBy, sortInfo) {
    const filteredSessions = await this.filterSessions(sessions, filterBy);
    switch (sortInfo.column) {
      case 'sessionTypeTitle':
        return this.sortBySessionTypeTitle(filteredSessions, sortInfo);
      case 'learnerGroupCount':
        return this.sortByLearnerGroupCount(filteredSessions, sortInfo);
      case 'firstOfferingDate':
        return this.sortByFirstOfferingDate(filteredSessions, sortInfo);
      case 'status':
        return this.sortByStatus(filteredSessions, sortInfo);
      default:
        if (sortInfo.descending) {
          return sortBy(filteredSessions, sortInfo.column).reverse();
        }
        return sortBy(filteredSessions, sortInfo.column);
    }
  }

  sessionStatus(session) {
    let status = this.intl.t('general.notPublished');
    if (session.published) {
      status = this.intl.t('general.published');
    }
    if (session.publishedAsTbd) {
      status = this.intl.t('general.scheduled');
    }
    return status.toString();
  }

  sortByStatus(sessions, sortInfo) {
    const sortProxies = sessions.map((session) => {
      return {
        session,
        status: this.sessionStatus(session),
      };
    });
    const sortedSessions = sortBy(sortProxies, 'status').map((proxy) => proxy.session);
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async sortBySessionTypeTitle(sessions, sortInfo) {
    const sortProxies = await map(sessions, async (session) => {
      const sessionType = await session.sessionType;
      const sessionTypeTitle = sessionType?.title;
      return {
        session,
        title: sessionTypeTitle,
      };
    });
    const sortedSessions = sortBy(sortProxies, 'title').map((proxy) => proxy.session);
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async sortByLearnerGroupCount(sessions, sortInfo) {
    const sortProxies = await map(sessions, async (session) => {
      const offerings = await session.offerings;
      const learnerGroups = await map(offerings, async (offering) => {
        return await offering.learnerGroups;
      });
      return {
        session,
        learnerGroupCount: learnerGroups.flat().length,
      };
    });
    const sortedSessions = sortBy(sortProxies, 'learnerGroupCount').map((proxy) => proxy.session);
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async sortByFirstOfferingDate(sessions, sortInfo) {
    const sortProxies = await map(sessions, async (session) => {
      const firstOfferingDate = await this.getFirstOfferingDate(session);
      return {
        session,
        firstOfferingDate,
      };
    });
    const sortedSessions = sortBy(sortProxies, 'firstOfferingDate').map((proxy) => proxy.session);
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async getFirstOfferingDate(session) {
    if (session.isIndependentLearning) {
      return (await session.ilmSession).dueDate;
    }
    const offerings = await session.offerings;
    return offerings
      .filter((offering) => Boolean(offering.startDate))
      .sort((a, b) => {
        const aDate = DateTime.fromJSDate(a.startDate);
        const bDate = DateTime.fromJSDate(b.startDate);
        if (aDate === bDate) {
          return 0;
        }
        return aDate > bDate ? 1 : -1;
      })[0]?.startDate;
  }

  async filterSessions(sessions, filterBy) {
    if (isEmpty(sessions)) {
      return [];
    }
    if (isEmpty(filterBy)) {
      return sessions;
    }

    const filterExpressions = filterBy.split(' ').map(function (string) {
      const clean = escapeRegExp(string);
      return new RegExp(clean, 'gi');
    });

    return filter(sessions, async (session) => {
      let matchedSearchTerms = 0;
      const sessionType = await session.sessionType;
      const sessionTypeTitle = sessionType?.title;
      const searchString = session.title + sessionTypeTitle + this.sessionStatus(session);
      for (let i = 0; i < filterExpressions.length; i++) {
        if (searchString.match(filterExpressions[i])) {
          matchedSearchTerms++;
        }
      }
      //if the number of matching search terms is equal to the number searched, return true
      return matchedSearchTerms === filterExpressions.length;
    });
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
    // eslint-disable-next-line ember/no-runloop
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
  expandSession(session) {
    if (session.offeringCount) {
      this.args.expandSession(session);
    }
  }

  removeSession = dropTask(async (session) => {
    session.deleteRecord();
    await session.save();
  });
}
