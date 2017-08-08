import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/week-glance';

const { Component, computed, inject } = Ember;
const { service } = inject;

export default Component.extend({
  layout,
  classNames: ['week-glance'],

  userEvents: service(),

  startOfWeek: 0,
  endOfWeek: 6,

  year: null,
  week: null,
  collapsible: true,
  collapsed: true,
  showFullTitle: false,

  midnightAtTheStartOfThisWeek: computed('year', 'week', 'startOfWeek', function(){
    const year = this.get('year');
    const week = this.get('week');
    const startOfWeek = this.get('startOfWeek');
    const targetDate = moment().year(year).isoWeek(week);
    return targetDate.day(startOfWeek).hour(0).minute(0);
  }),
  midnightAtTheEndOfThisWeek: computed('year', 'week', 'endOfWeek', async function(){
    const year = this.get('year');
    const week = this.get('week');
    const endOfWeek = this.get('endOfWeek');
    const targetDate = moment().year(year).isoWeek(week);
    return targetDate.day(endOfWeek).hour(23).minute(59).second(59);
  }),
  title: computed('midnightAtTheStartOfThisWeek', 'midnightAtTheEndOfThisWeek', async function(){
    const midnightAtTheStartOfThisWeek = await this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = await this.get('midnightAtTheEndOfThisWeek');
    const from = midnightAtTheStartOfThisWeek.format('MMMM D');

    let to;
    if (midnightAtTheStartOfThisWeek.month() != midnightAtTheEndOfThisWeek.month()) {
      to = midnightAtTheEndOfThisWeek.format('MMMM D');

      return `${from} - ${to}`;
    } else {
      to = midnightAtTheEndOfThisWeek.format('D');

      return `${from}-${to}`;
    }


  }),

  weekEvents: computed('midnightAtTheStartOfThisWeek', 'midnightAtTheEndOfThisWeek', async function() {
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
  actions: {
    sortString(a, b){
      return a.localeCompare(b);
    }
  }
});
