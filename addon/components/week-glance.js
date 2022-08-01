import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import moment from 'moment';
import scrollIntoView from 'scroll-into-view';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class WeeklyGlance extends Component {
  @service userEvents;
  @service intl;

  @use weekEvents = new ResolveAsyncValue(() => [
    this.userEvents.getEvents(
      this.midnightAtTheStartOfThisWeek.unix(),
      this.midnightAtTheEndOfThisWeek.unix()
    ),
  ]);

  get thursdayOfTheWeek() {
    this.intl; //we need to use the service so the CP will re-fire
    const thursdayOfTheWeek = moment();
    thursdayOfTheWeek.year(this.args.year);
    thursdayOfTheWeek.day(4);
    thursdayOfTheWeek.isoWeek(this.args.week);
    thursdayOfTheWeek.hour(0).minute(0).second(0);

    return thursdayOfTheWeek;
  }

  get midnightAtTheStartOfThisWeek() {
    return this.thursdayOfTheWeek.clone().subtract(4, 'days');
  }

  get midnightAtTheEndOfThisWeek() {
    return this.thursdayOfTheWeek.clone().add(2, 'days').hour(23).minute(59).second(59);
  }

  get publishedWeekEvents() {
    if (!this.weekEvents) {
      return [];
    }

    return this.weekEvents.filter((ev) => {
      return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
    });
  }

  @action
  scrollOnLoad(element) {
    if (this.args.week === this.args.weekInFocus) {
      scrollIntoView(element);
    }
  }

  get title() {
    if (!this.midnightAtTheStartOfThisWeek || !this.midnightAtTheEndOfThisWeek) {
      return '';
    }

    const from = this.midnightAtTheStartOfThisWeek.format('MMMM D');
    let to;
    if (this.midnightAtTheStartOfThisWeek.month() !== this.midnightAtTheEndOfThisWeek.month()) {
      to = this.midnightAtTheEndOfThisWeek.format('MMMM D');
      return `${from} - ${to}`;
    }
    to = this.midnightAtTheEndOfThisWeek.format('D');
    return `${from}-${to}`;
  }

  get nonIlmPreWorkEvents() {
    if (!this.publishedWeekEvents) {
      return [];
    }
    return this.publishedWeekEvents.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }
}
