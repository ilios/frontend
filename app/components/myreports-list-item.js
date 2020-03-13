import Component from '@ember/component';
import ReportTitleMixin from 'ilios/mixins/report-title';
import { task } from 'ember-concurrency';

export default Component.extend(ReportTitleMixin, {
  tagName: "",
  reporttitle: null,
  onReportSelect() {},

  didReceiveAttrs() {
    this._super(...arguments);
    const report = this.report;
    this.loadTitle.perform(report);
  },

  loadTitle: task(function* (report) {
    const title = yield this.getReportTitle(report);
    this.set('reporttitle', title);
  }).restartable()
});
