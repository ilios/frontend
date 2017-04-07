import Ember from 'ember';
import moment from 'moment';

const { Component, computed, inject } = Ember;
const { service } = inject;

export default Component.extend({
  /**
   * Days in advance of the current date.
   * @property daysInAdvance
   * @type int
   * @public
   */
  daysInAdvance: 60,

  classNames: ['dashboard-agenda'],

  userEvents: service(),

  weeksEvents: computed('daysInAdvance', function() {
    const daysInAdvance = this.get('daysInAdvance');
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(daysInAdvance, 'days').unix();

    return this.get('userEvents').getEvents(from, to);
  }),
});
