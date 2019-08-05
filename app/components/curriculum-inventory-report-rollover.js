import Component from '@ember/component';
import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  name: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    })
  ],
  startDate: [
    validator('date', {
      dependentKeys: ['model.endDate'],
      onOrBefore: reads('model.endDate'),
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['model.startDate'],
      onOrAfter: reads('model.startDate'),
    })
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  commonAjax: service(),
  flashMessages: service(),
  iliosConfig: service(),
  store: service(),

  classNames: ['curriculum-inventory-report-rollover'],

  description: null,
  isSaving: false,
  name: null,
  report: null,
  selectedYear: null,
  years: null,
  startDate: null,
  endDate: null,

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  didReceiveAttrs() {
    this._super(...arguments);
    const report = this.report;
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const reportYear = parseInt(report.get('year'), 10);
    const reportStartDate = report.get('startDate');
    const reportEndDate = report.get('endDate');
    const startYear = Math.min(thisYear, reportYear);
    const endYear = Math.max(thisYear, reportYear) + 5;
    let years = [];
    for (let i = startYear; i < endYear; i++) {
      if (i === reportYear) {
        continue;
      }
      let title = i + ' - ' + (i + 1);
      let year = EmberObject.create({ 'id': i, 'title': title });
      years.pushObject(year);
    }
    let selectedYear = years.findBy('id', startYear + 1);
    if (! selectedYear) {
      selectedYear = years.findBy('id', reportYear + 1);
    }

    const newReportYear = selectedYear.id;
    const yearDiff = moment(reportEndDate).get('year') - moment(reportStartDate).get('year');
    const startDate = moment(reportStartDate).set('year', newReportYear).toDate();
    const endDate = moment(reportEndDate).set('year', newReportYear + yearDiff).toDate();

    console.log(reportStartDate);
    console.log(reportEndDate);
    console.log(startDate);
    console.log(endDate);

    this.set('name', report.get('name'));
    this.set('startDate', startDate);
    this.set('endDate', endDate);
    this.set('description', report.get('description'));
    this.set('selectedYear', selectedYear);
    this.set('years', years);
  },

  actions: {
    changeName(newName){
      this.set('name', newName);
    },
  },

  save: task(function* () {
    this.set('isSaving', true);
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['name']);
    let {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      this.set('isSaving', false);
      return;
    }
    const commonAjax = this.commonAjax;
    const reportId = this.get('report.id');
    const year = this.selectedYear.get('id');
    const description = this.description;
    const name = this.name;
    const startDate = this.startDate;
    const endDate = this.endDate;
    let data = {
      name,
      description,
      year,
      startDate,
      endDate
    };
    const host = this.host ? this.host : '';
    const namespace = this.namespace;

    let url = host + '/' + namespace + `/curriculuminventoryreports/${reportId}/rollover`;
    const newReportObj = yield commonAjax.request(url, {
      method: 'POST',
      data
    });

    const flashMessages = this.flashMessages;
    const store = this.store;
    flashMessages.success('general.curriculumInventoryReportRolloverSuccess');
    store.pushPayload(newReportObj);
    let newReport = store.peekRecord('curriculum-inventory-report', newReportObj.curriculumInventoryReports[0].id);

    return this.visit(newReport);
  }).drop(),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.save.perform();
    }
  }
});
