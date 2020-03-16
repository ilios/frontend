import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import DomMixin from 'ember-lifeline/mixins/dom';
import ReportTitleMixin from 'ilios/mixins/report-title';
import PapaParse from 'papaparse';
import createDownloadFile from '../utils/create-download-file';
import { runDisposables } from 'ember-lifeline';

export default Component.extend(DomMixin, ReportTitleMixin, {
  currentUser: service(),
  preserveScroll: service(),
  reporting: service(),
  store: service(),
  tagName: "",
  finishedBuildingReport: false,
  myReportEditorOn: false,
  scrollKey: 'reportList',
  selectedReport: null,
  selectedYear: null,
  user: null,
  onReportSelect() {},
  onReportYearSelect() {},

  /**
   * @property sortedReports
   * @type {Ember.computed}
   * @public
   */
  sortedReports: computed('user.reports.[]', async function() {
    const reports = await this.user.get('reports');
    return reports.sortBy('title');
  }),

  reportResultsList: computed('selectedReport', 'selectedYear', async function() {
    const report = this.selectedReport;
    const year = this.selectedYear;
    return report ? await this.reporting.getResults(report, year) : [];
  }),

  allAcademicYears: computed(async function () {
    const store = this.store;
    const years = await store.findAll('academic-year');
    return years;
  }),

  showAcademicYearFilter: computed('selectedReport', function() {
    const report = this.selectedReport;
    if(!report){
      return false;
    }
    const subject = report.subject;
    const prepositionalObject = report.prepositionalObject;
    return prepositionalObject != 'course' && ['course', 'session'].includes(subject);
  }),

  selectedReportTitle: computed('selectedReport', async function() {
    const report = this.selectedReport;
    return this.getReportTitle(report);
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    this.loadAttr.perform();
  },

  didRender() {
    this._super(...arguments);
    const element = document.querySelector('.dashboard-block-body');
    const yPos = this.preserveScroll[this.scrollKey];

    if (yPos > 0) {
      element.scrollTop = yPos;
    }

    if (element) {
      this.addEventListener(element, 'scroll', () => {
        this.preserveScroll.set(this.scrollKey, element.scrollTop);
      });
    }
  },

  actions: {
    toggleEditor() {
      this.set('myReportEditorOn', !this.myReportEditorOn);
    },

    closeEditor() {
      this.set('myReportEditorOn', false);
    },

    deleteReport(report) {
      report.deleteRecord();
      report.save();
    }
  },

  destroy() {
    runDisposables(this);
    this._super(...arguments);
  },

  downloadReport: task(function* () {
    const report = this.selectedReport;
    const title = yield this.getReportTitle(report);
    const year = this.selectedYear;
    const data = yield this.reporting.getArrayResults(report, year);
    this.set('finishedBuildingReport', true);
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.set('finishedBuildingReport', false);
  }).drop(),

  loadAttr: task(function* () {
    const user = yield this.currentUser.get('model');
    this.set('user', user);
  })
});
