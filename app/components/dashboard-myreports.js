import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import ReportTitleMixin from 'ilios/mixins/report-title';
import PapaParse from 'papaparse';
import createDownloadFile from '../utils/create-download-file';

const { Promise, resolve } = RSVP;

export default Component.extend(ReportTitleMixin, {
  currentUser: service(),
  reporting: service(),
  store: service(),
  tagName: 'div',
  classNames: ['dashboard-myreports'],
  myReportEditorOn: false,
  selectedReport: null,
  selectedYear: null,
  user: null,
  finishedBuildingReport: false,

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
  reportResultsList: computed('selectedReport', 'selectedYear', function(){
    const report = this.get('selectedReport');
    const year = this.get('selectedYear');
    if(!report){
      return resolve([]);
    }
    return this.get('reporting').getResults(report, year);
  }),
  allAcademicYears: computed(async function () {
    const store = this.get('store');
    const years = await store.findAll('academic-year');

    return years;
  }),
  showAcademicYearFilter: computed('selectedReport', function(){
    const report = this.get('selectedReport');
    if(!report){
      return false;
    }
    const subject = report.get('subject');
    const prepositionalObject = report.get('prepositionalObject');

    return prepositionalObject != 'course' && ['course', 'session'].includes(subject);
  }),
  downloadReport: task(function* () {
    const report = this.get('selectedReport');
    const title = yield this.getReportTitle(report);
    const year = this.get('selectedYear');
    const data = yield this.get('reporting').getArrayResults(report, year);
    this.set('finishedBuildingReport', true);
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.set('finishedBuildingReport', false);
  }).drop(),
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
    },
  }
});
