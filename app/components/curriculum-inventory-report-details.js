import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { alias } = computed;
const { service } = inject;

export default Component.extend({
  store: service(),
  report: null,
  isFinalized: alias('report.isFinalized'),
  showFinalizeConfirmation: false,
  isFinalizing: false,

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
        this.set('isFinalized', true);
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
