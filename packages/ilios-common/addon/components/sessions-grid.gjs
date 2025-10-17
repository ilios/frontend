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
  get sortedSessionProxiesData() {
    return new TrackedAsyncData(
      this.sortSessionProxies(this.sessionProxies, this.args.filterBy, this.sortInfo),
    );
  }

  get sortedSessionProxies() {
    return this.sortedSessionProxiesData.isResolved ? this.sortedSessionProxiesData.value : [];
  }

  get sessionProxies() {
    if (!this.args.sessions) {
      return [];
    }
    const titlesMap = new Map();
    return this.args.sessions.map((session) => {
      // a11y doesn't care about case sensitivity.
      const key = session.title.toLowerCase().trim();
      const proxy = { session, ariaLabel: session.title.trim() };
      if (!titlesMap.has(key)) {
        titlesMap.set(key, 1);
      } else {
        const count = titlesMap.get(key) + 1;
        titlesMap.set(key, count);
        proxy.ariaLabel = `${proxy.ariaLabel}, ${count}`;
      }
      return proxy;
    });
  }

  async sortSessionProxies(sessionProxies, filterBy, sortInfo) {
    const filteredSessionProxies = await this.filterSessionProxies(sessionProxies, filterBy);
    switch (sortInfo.column) {
      case 'sessionTypeTitle':
        return this.sortBySessionTypeTitle(filteredSessionProxies, sortInfo);
      case 'learnerGroupCount':
        return this.sortByLearnerGroupCount(filteredSessionProxies, sortInfo);
      case 'firstOfferingDate':
        return this.sortByFirstOfferingDate(filteredSessionProxies, sortInfo);
      case 'status':
        return this.sortByStatus(filteredSessionProxies, sortInfo);
      default:
        return this.sortBy(filteredSessionProxies, sortInfo);
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

  get isDestroyed() {
    return super.isDestroyed;
  }

  sortBy(sessionProxies, sortInfo) {
    const sortProxies = sessionProxies.map((sessionProxy) => {
      return {
        sessionProxy,
        sortColumn: sessionProxy.session.get(sortInfo.column),
      };
    });
    const sortedSessionProxies = sortBy(sortProxies, 'sortColumn').map(
      (sortProxy) => sortProxy.sessionProxy,
    );
    return sortInfo.descending ? sortedSessionProxies.reverse() : sortedSessionProxies;
  }

  sortByStatus(sessionProxies, sortInfo) {
    const sortProxies = sessionProxies.map((sessionProxy) => {
      return {
        sessionProxy,
        status: this.sessionStatus(sessionProxy.session),
      };
    });
    const sortedSessions = sortBy(sortProxies, 'status').map((proxy) => proxy.session);
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async sortBySessionTypeTitle(sessionProxies, sortInfo) {
    const sortProxies = await map(sessionProxies, async (sessionProxy) => {
      const sessionType = await sessionProxy.session.sessionType;
      const sessionTypeTitle = sessionType?.title;
      return {
        sessionProxy,
        title: sessionTypeTitle,
      };
    });
    const sortedSessions = sortBy(sortProxies, 'title').map((sortProxy) => sortProxy.sessionProxy);
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async sortByLearnerGroupCount(sessionProxies, sortInfo) {
    const sortProxies = await map(sessionProxies, async (sessionProxy) => {
      const offerings = await sessionProxy.session.offerings;
      const learnerGroups = await map(offerings, async (offering) => {
        return await offering.learnerGroups;
      });
      return {
        sessionProxy,
        learnerGroupCount: learnerGroups.flat().length,
      };
    });
    const sortedSessions = sortBy(sortProxies, 'learnerGroupCount').map(
      (sortProxy) => sortProxy.sessionProxy,
    );
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async sortByFirstOfferingDate(sessionProxies, sortInfo) {
    const sortProxies = await map(sessionProxies, async (sessionProxy) => {
      const firstOfferingDate = await this.getFirstOfferingDate(sessionProxy);
      return {
        sessionProxy,
        firstOfferingDate,
      };
    });
    const sortedSessions = sortBy(sortProxies, 'firstOfferingDate').map(
      (sortProxy) => sortProxy.sessionProxy,
    );
    return sortInfo.descending ? sortedSessions.reverse() : sortedSessions;
  }

  async getFirstOfferingDate(sessionProxy) {
    if (sessionProxy.session.isIndependentLearning) {
      return (await sessionProxy.session.ilmSession).dueDate;
    }
    const offerings = await sessionProxy.session.offerings;
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

  async filterSessionProxies(sessionProxies, filterBy) {
    if (isEmpty(sessionProxies)) {
      return [];
    }
    if (isEmpty(filterBy)) {
      return sessionProxies;
    }

    const filterExpressions = filterBy.split(' ').map(function (string) {
      const clean = escapeRegExp(string);
      return new RegExp(clean, 'gi');
    });

    return filter(sessionProxies, async (proxy) => {
      let matchedSearchTerms = 0;
      const sessionType = await proxy.session.sessionType;
      const sessionTypeTitle = sessionType?.title;
      const searchString =
        proxy.session.title + sessionTypeTitle + this.sessionStatus(proxy.session);
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
      {{#each this.sortedSessionProxies as |proxy|}}
        <div
          class="session{{if
              (includes proxy.session.id @expandedSessionIds)
              ' is-expanded'
              ' not-expanded'
            }}"
          data-test-expanded-session={{includes proxy.session.id @expandedSessionIds}}
          data-test-session
        >
          <SessionsGridRow
            @sessionProxy={{proxy}}
            @confirmDelete={{this.confirmDelete}}
            @closeSession={{@closeSession}}
            @expandSession={{this.expandSession}}
            @expandedSessionIds={{@expandedSessionIds}}
          />
          {{#if (includes proxy.session.id this.confirmDeleteSessionIds)}}
            <div class="confirm-removal" data-test-confirm-removal>
              {{t "general.confirmSessionRemoval"}}
              <div class="confirm-buttons">
                <button
                  class="cancel"
                  type="button"
                  data-test-yes
                  disabled={{this.removeSession.isRunning}}
                  {{on "click" (perform this.removeSession proxy.session)}}
                >
                  {{#if this.removeSession.isRunning}}
                    <LoadingSpinner />
                  {{else}}
                    {{t "general.yes"}}
                  {{/if}}
                </button>
                <button
                  class="done"
                  type="button"
                  {{on "click" (fn this.cancelDelete proxy.session.id)}}
                >
                  {{t "general.cancel"}}
                </button>
              </div>
            </div>
          {{/if}}
          {{#if (includes proxy.session.id @expandedSessionIds)}}
            <SessionsGridLastUpdated @session={{proxy.session}} />
            <SessionsGridOfferingTable
              @session={{proxy.session}}
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
