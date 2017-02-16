import Ember from 'ember';

const { computed, inject, Component, RSVP } = Ember;
const { service } = inject;
const { Promise, resolve } = RSVP;

export default Component.extend({
  reporting: service(),
  tagName: 'div',
  classNames: ['dashboard-block', 'dashboard-double-block', 'dashboard-myreports'],
  myReportEditorOn: false,
  selectedReport: null,

  /**
   * @property sortedReports
   * @type {Ember.computed}
   * @public
   */
  sortedReports: computed('reporting.reportsList.[]', function(){
    return new Promise(resolve => {
      this.get('reporting').get('reportsList').then(reports => {
        resolve(reports.sortBy('title'));
      });
    });
  }),
  reportResultsList: computed('selectedReport', function(){
    const report = this.get('selectedReport');
    if(!report){
      return resolve([]);
    }
    return this.get('reporting').getResults(report);
  }),
  actions: {
    toggleEditor() {
      this.set('myReportEditorOn', !this.get('myReportEditorOn'));
    },
    closeEditor() {
      this.set('myReportEditorOn', false);
    },
    selectReport(report){
      this.set('selectedReport', report);
    },
    deleteReport(report){
      report.deleteRecord();
      report.save();
    }
  }
});
