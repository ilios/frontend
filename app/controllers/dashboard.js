import Controller from '@ember/controller';
import { computed } from '@ember/object';
import DashboardController from 'ilios-common/mixins/dashboard-controller';

export default Controller.extend(DashboardController, {
  queryParams: ['report', 'reportYear'],

  report: null,
  reportYear: '',

  selectedReport: computed('report', async function() {
    const reportId = this.report;
    const store = this.store;

    if (reportId) {
      const report = store.peekRecord('report', reportId);
      return report ? report : await store.findRecord('report', reportId);
    }
  })
});
