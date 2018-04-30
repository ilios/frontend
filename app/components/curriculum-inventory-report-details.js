/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  report: null,
  canUpdate: false,
  showFinalizeConfirmation: false,
  isFinalizing: false,
  classNames: ['curriculum-inventory-report-details'],
  'data-test-curriculum-inventory-report-details': true,

  actions: {
    cancelFinalization(){
      this.set('showFinalizeConfirmation', false);
    },
    finalize(){
      this.set('isFinalizing', true);
      const report = this.get('report');
      let repExport = this.get('store').createRecord('curriculumInventoryExport', {
        report: report,
      });
      repExport.save().then((savedExport) => {
        report.set('export', savedExport);
      }).finally(()=>{
        this.set('showFinalizeConfirmation', false);
        this.set('isFinalizing', false);
      });
    },
    confirmFinalization(){
      this.set('showFinalizeConfirmation', true);
    },
  }
});
