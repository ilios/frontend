import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/dashboard-agenda';
import moment from 'moment';

export default Component.extend({
  userEvents: service(),

  layout,
  areEventsSelectable: true,
  /**
   * Days in advance of the current date.
   * @property daysInAdvance
   * @type int
   * @public
   */
  daysInAdvance: 60,

  classNames: ['dashboard-agenda'],

  sixDaysAgo: moment().hour(0).minute(0).subtract(6, 'days'),
  weeksEvents: computed('daysInAdvance', async function() {
    const daysInAdvance = this.get('daysInAdvance');
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(daysInAdvance, 'days').unix();

    return await this.get('userEvents').getEvents(from, to);
  }),

  ilmPreWorkEvents: computed('weeksEvents.[]', async function () {
    const events = await this.get('weeksEvents');
    const preWork =  events.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    return preWork.filter(ev => ev.ilmSession);
  }),

  nonIlmPreWorkEvents: computed('weeksEvents.[]', async function () {
    const events = await this.get('weeksEvents');
    return events.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }),
});
