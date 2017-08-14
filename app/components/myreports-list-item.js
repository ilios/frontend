import Ember from 'ember';
import ReportTitleMixin from 'ilios/mixins/report-title';
import { task } from 'ember-concurrency';


export default Ember.Component.extend(ReportTitleMixin, {
  reporttitle: null,
  tagName: 'span',

  didReceiveAttrs() {
    this._super(...arguments);
    const report = this.get('report');
    this.get('loadTitle').perform(report);
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
