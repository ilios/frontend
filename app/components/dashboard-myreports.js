import Ember from 'ember';
import DS from 'ember-data';

const { computed, RSVP, inject, Component } = Ember;
const { service } = inject;

export default Component.extend({
  currentUser: service(),
  reportResults: service(),
  tagName: 'div',
  classNames: ['dashboard-block', 'dashboard-double-block'],
  myReportEditorOn: false,
  selectedReport: null,
  reportSorting: ['title'],
  sortedReports: computed.sort('listOfReports', 'reportSorting'),
  listOfReports: computed('currentUser.model.allRelatedCourses.[]', function(){
    let defer = RSVP.defer();
    this.get('currentUser').get('model').then( user => {
      user.get('reports').then( reports => {
        defer.resolve(reports);
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  reportResultsList: computed('selectedReport', function(){
    let defer = RSVP.defer();
    const reportResults = this.get('reportResults');
    const report = this.get('selectedReport');
    if(!report){
      defer.resolve([]);
      return;
    }
    const subject = report.get('subject');
    const object = report.get('prepositionalObject');
    const objectId = report.get('prepositionalObjectTableRowId');
    
    reportResults.getResults(subject, object, objectId).then(results => {
      defer.resolve(results.sortBy('value'));
    });
    
    return DS.PromiseArray.create({
      promise: defer.promise
    });
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
