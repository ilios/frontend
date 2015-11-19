import Ember from 'ember';
import DS from 'ember-data';

const { computed, inject, Component } = Ember;
const { service } = inject;
const { PromiseArray } = DS;

export default Component.extend({
  reporting: service(),
  tagName: 'div',
  classNames: ['dashboard-block', 'dashboard-double-block'],
  myReportEditorOn: false,
  selectedReport: null,
  reportSorting: ['title'],
  sortedReports: computed.sort('listOfReports', 'reportSorting'),
  listOfReports: computed('reporting.reportsList.[]', function(){
    return PromiseArray.create({
      promise: this.get('reporting').get('reportsList')
    });
  }),
  reportResultsList: computed('selectedReport', function(){
    const report = this.get('selectedReport');
    if(!report){
      return [];
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
