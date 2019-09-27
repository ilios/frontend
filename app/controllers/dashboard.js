import Controller from '@ember/controller';
import { computed } from '@ember/object';
import DashboardController from 'ilios-common/mixins/dashboard-controller';

export default Controller.extend(DashboardController, {
  queryParams: ['report', 'reportYear'],

  report: null,
  reportYear: '',

  selectedReport: computed('report', async function () {
    if (!this.report) {
      return null;
    }
    const report = this.store.peekRecord('report', this.report);
    return report ? report : await this.store.findRecord('report', this.report);
  })
});
