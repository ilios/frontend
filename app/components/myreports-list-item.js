/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import ReportTitleMixin from 'ilios/mixins/report-title';
import { task } from 'ember-concurrency';


export default Component.extend(ReportTitleMixin, {
  reporttitle: null,
  classNames: ['myreports-list-item'],
  tagName: 'span',

  didReceiveAttrs() {
    this._super(...arguments);
    const report = this.report;
    this.loadTitle.perform(report);
  },

  loadTitle: task(function * (report) {
    const title = yield this.getReportTitle(report);
    this.set('reporttitle', title);
  }).restartable(),

  actions: {
    selectReport(report) {
      this.sendAction('selectReport', report);
    }
  }
});
