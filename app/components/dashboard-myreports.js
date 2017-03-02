import Ember from 'ember';
import { task } from 'ember-concurrency';


const { computed, inject, Component, RSVP } = Ember;
const { service } = inject;
const { Promise, resolve } = RSVP;

export default Component.extend({
  currentUser: service(),
  reporting: service(),
  tagName: 'div',
  classNames: ['dashboard-block', 'dashboard-double-block', 'dashboard-myreports'],
  myReportEditorOn: false,
  selectedReport: null,
  user: null,

  didReceiveAttrs() {
    this._super(...arguments);
    this.get('loadAttr').perform();
  },

  loadAttr: task(function * () {
    const user = yield this.get('currentUser').get('model');
    this.set('user', user);
  }),

  /**
   * @property sortedReports
   * @type {Ember.computed}
   * @public
   */
  sortedReports: computed('user.reports.[]', function(){
    return new Promise(resolve => {
      this.get('user').get('reports').then(reports => {
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
