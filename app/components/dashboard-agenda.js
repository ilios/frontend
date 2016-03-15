import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { PromiseArray } = DS;

export default Component.extend({
  /**
   * Days in advance of the current date.
   * @property daysInAdvance
   * @type int
   * @public
   */
  daysInAdvance: 60,

  init() {
    this._super(...arguments);

    const fromTimeStamp = moment().hour(0).minute(0).unix();
    const toTimeStamp = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();

    this.setProperties({ fromTimeStamp, toTimeStamp });
  },

  classNames: ['dashboard-agenda'],

  userEvents: service(),

  weeksEvents: computed('fromTimeStamp', 'toTimeStamp', function() {
    const from = this.get('fromTimeStamp');
    const to = this.get('toTimeStamp');

    return PromiseArray.create({
      promise: this.get('userEvents').getEvents(from, to)
    });
  }),
});
