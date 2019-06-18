import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import EventMixin from 'ilios-common/mixins/events';
import moment from 'moment';

export default Component.extend(EventMixin, {
  commonAjax: service(),
  iliosConfig: service(),

  classNames: ['user-profile-calendar'],

  date: null,
  user: null,

  namespace: reads('iliosConfig.apiNameSpace'),

  calendarEvents: computed('user.id', 'date', async function() {
    const commonAjax = this.commonAjax;
    const user = this.user;
    const date = this.date;
    const from = moment(date).day(0).hour(0).minute(0).second(0).format('X');
    const to = moment(date).day(6).hour(23).minute(59).second(59).format('X');

    const namespace = this.namespace;
    let url = '';
    if (namespace) {
      url += '/' + namespace;
    }
    url += '/userevents/' + user.get('id') + '?from=' + from + '&to=' + to;
    const data = await commonAjax.request(url);
    return data.userEvents.map(obj => this.createEventFromData(obj, true)).sortBy('startDate', 'name');
  }),

  init() {
    this._super(...arguments);
    this.set('date', new Date());
  },

  actions: {
    goForward() {
      const date = this.date;
      let newDate = moment(date).add(1, 'week').toDate();
      this.set('date', newDate);
    },

    goBack() {
      const date = this.date;
      let newDate = moment(date).subtract(1, 'week').toDate();
      this.set('date', newDate);
    },

    gotoToday() {
      let newDate = moment().toDate();
      this.set('date', newDate);
    }
  }
});
