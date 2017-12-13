import Ember from 'ember';
import moment from 'moment';
import layout from '../templates/components/week-glance';

const { Component, computed } = Ember;

export default Component.extend({
  layout,
  classNames: ['week-glance'],

  userEvents: Ember.inject.service(),
  i18n: Ember.inject.service(),

  startOfWeek: 0,
  endOfWeek: 6,

  year: null,
  week: null,
  collapsible: true,
  collapsed: true,
  showFullTitle: false,

  midnightAtTheStartOfThisWeek: computed('i18n.locale', 'year', 'week', 'startOfWeek', function(){
    this.get('i18n'); //we need to use the service so the CP will re-fire
    const year = this.get('year');
    const week = this.get('week');
    const startOfWeek = this.get('startOfWeek');
    const targetDate = moment();
    targetDate.year(year);
    targetDate.isoWeek(week);
    targetDate.day(startOfWeek);
    return targetDate.hour(0).minute(0);
  }),
  midnightAtTheEndOfThisWeek: computed('i18n.locale', 'year', 'week', 'endOfWeek', function(){
    this.get('i18n'); //we need to use the service so the CP will re-fire
    const year = this.get('year');
    const week = this.get('week');
    const endOfWeek = this.get('endOfWeek');
    const targetDate = moment();
    targetDate.year(year);
    targetDate.isoWeek(week);
    targetDate.day(endOfWeek);
    return targetDate.hour(23).minute(59).second(59);
  }),
  title: computed('midnightAtTheStartOfThisWeek', 'midnightAtTheEndOfThisWeek', function(){
    const midnightAtTheStartOfThisWeek = this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = this.get('midnightAtTheEndOfThisWeek');
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
    const midnightAtTheStartOfThisWeek = this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = this.get('midnightAtTheEndOfThisWeek');

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
