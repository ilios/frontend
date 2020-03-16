import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  store: service(),
  tagName: "",
  canUpdate: false,
  isFinalizing: false,
  report: null,
  showFinalizeConfirmation: false,

  actions: {
    cancelFinalization() {
      this.set('showFinalizeConfirmation', false);
    },

    finalize() {
      this.set('isFinalizing', true);
      const report = this.report;
      const repExport = this.store.createRecord('curriculumInventoryExport', {
        report: report,
      });
      repExport.save().then((savedExport) => {
        report.set('export', savedExport);
      }).finally(()=>{
        this.set('showFinalizeConfirmation', false);
        this.set('isFinalizing', false);
      });
    },

    confirmFinalization() {
      this.set('showFinalizeConfirmation', true);
    }
  }
});
