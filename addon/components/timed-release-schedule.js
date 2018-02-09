import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import layout from '../templates/components/timed-release-schedule';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['timed-release-schedule'],
  startDate: null,
  endDate: null,
  now: null,
  showNoSchedule: true,
  startDateInTheFuture: computed('startDate', 'now', function () {
    const startDate = this.get('startDate');
    const now = this.get('now');
    if (!startDate || !now) {
      return false;
    }
    return moment(startDate).isAfter(now);
  }),
  endDateInTheFuture: computed('endDate', 'now', function () {
    const endDate = this.get('endDate');
    const now = this.get('now');
    if (!endDate || !now) {
      return false;
    }
    return moment(endDate).isAfter(now);
  }),
  init() {
    this._super();
    const now = new Date();
    this.set('now', now);
  }
});
