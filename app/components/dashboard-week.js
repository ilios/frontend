import Ember from 'ember';
import moment from 'moment';

const { Component, computed, inject } = Ember;
const { service } = inject;

export default Component.extend({
  classNames: ['dashboard-week'],

  userEvents: service(),

  startOfWeek: 1,
  endOfWeek: 7,

  midnightAtTheStartOfThisWeek: computed('startOfWeek', function(){
    const startOfWeek = this.get('startOfWeek');
    return moment().day(startOfWeek).hour(0).minute(0);
  }),
  midnightAtTheEndOfThisWeek: computed('endOfWeek', async function(){
    const endOfWeek = await this.get('endOfWeek');
    return moment().day(endOfWeek).hour(11).minute(59).second(59);
  }),
  title: computed('midnightAtTheStartOfThisWeek', 'midnightAtTheEndOfThisWeek', async function(){
    const midnightAtTheStartOfThisWeek = await this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = await this.get('midnightAtTheEndOfThisWeek');
    const from = midnightAtTheStartOfThisWeek.format('MMMM D');

    let to;
    if (midnightAtTheStartOfThisWeek.month() != midnightAtTheEndOfThisWeek.month()) {
      to = midnightAtTheEndOfThisWeek.format(' MMMM D');
    } else {
      to = midnightAtTheEndOfThisWeek.format('D');
    }

    return `${from}-${to}`;
  }),

  weekEvents: computed('midnightStartOfLastWeek', 'midnightEndOfNextWeek', async function() {
    const midnightAtTheStartOfThisWeek = await this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = await this.get('midnightAtTheEndOfThisWeek');

    const from = midnightAtTheStartOfThisWeek.unix();
    const to = midnightAtTheEndOfThisWeek.unix();

    return await this.get('userEvents').getEvents(from, to);
  }),

  publishedWeekEvents: computed('weekEvents.[]', async function() {
    const weekEvents = await this.get('weekEvents');
    return weekEvents.filter(ev => {
      return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
    });
  }),
});
