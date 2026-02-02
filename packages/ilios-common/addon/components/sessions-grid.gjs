import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { next } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { filter, map } from 'rsvp';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import includes from 'ilios-common/helpers/includes';
import SessionsGridRow from 'ilios-common/components/sessions-grid-row';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { fn } from '@ember/helper';
import SessionsGridLastUpdated from 'ilios-common/components/sessions-grid-last-updated';
import SessionsGridOfferingTable from 'ilios-common/components/sessions-grid-offering-table';

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

  removeSession = task({ drop: true }, async (session) => {
    session.deleteRecord();
    await session.save();
  });
  <template>
    <div class="sessions-grid" data-test-sessions-grid>
      {{#each this.sortedSessions as |session|}}
        <div
          class="session{{if
              (includes session.id @expandedSessionIds)
              ' is-expanded'
              ' not-expanded'
            }}"
          data-test-expanded-session={{includes session.id @expandedSessionIds}}
          data-test-session
        >
          <SessionsGridRow
            @session={{session}}
            @sessionsForRemovalConfirmation={{this.confirmDeleteSessionIds}}
            @confirmDelete={{this.confirmDelete}}
            @closeSession={{@closeSession}}
            @expandSession={{this.expandSession}}
            @expandedSessionIds={{@expandedSessionIds}}
          />
          {{#if (includes session.id this.confirmDeleteSessionIds)}}
            <div class="confirm-removal" data-test-confirm-removal>
              {{t "general.confirmRemoveSession"}}
              <div class="confirm-buttons">
                <button
                  type="button"
                  class="remove"
                  disabled={{this.removeSession.isRunning}}
                  {{on "click" (perform this.removeSession session)}}
                  data-test-yes
                >
                  {{#if this.removeSession.isRunning}}
                    <LoadingSpinner />
                  {{else}}
                    {{t "general.yes"}}
                  {{/if}}
                </button>
                <button
                  type="button"
                  class="done text"
                  {{on "click" (fn this.cancelDelete session.id)}}
                  data-test-cancel
                >
                  {{t "general.cancel"}}
                </button>
              </div>
            </div>
          {{/if}}
          {{#if (includes session.id @expandedSessionIds)}}
            <SessionsGridLastUpdated @session={{session}} />
            <SessionsGridOfferingTable
              @session={{session}}
              @headerIsLocked={{@headerIsLocked}}
              @setHeaderLockedStatus={{@setHeaderLockedStatus}}
            />
          {{/if}}
        </div>
      {{else}}
        <div class="no-results" data-test-no-results>{{t "general.noResultsFound"}}</div>
      {{/each}}
    </div>
  </template>
}
