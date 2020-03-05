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
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  fetch: service(),
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

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  didReceiveAttrs() {
    this._super(...arguments);
    const report = this.report;
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const reportYear = parseInt(report.get('year'), 10);
    const startYear = Math.min(thisYear, reportYear);
    const endYear = Math.max(thisYear, reportYear) + 5;
    const years = [];
    for (let i = startYear; i < endYear; i++) {
      if (i === reportYear) {
        continue;
      }
      const title = i + ' - ' + (i + 1);
      const year = EmberObject.create({ 'id': i, 'title': title });
      years.pushObject(year);
    }
    let selectedYear = years.findBy('id', startYear + 1);
    if (! selectedYear) {
      selectedYear = years.findBy('id', reportYear + 1);
    }
    this.set('name', report.get('name'));
    this.set('description', report.get('description'));
    this.set('selectedYear', selectedYear);
    this.set('years', years);
  },

  actions: {
    changeName(newName){
      this.set('name', newName);
    },
    setSelectedYear(event) {
      const id = Number(event.target.value);
      const year = this.years.findBy('id', id);
      this.set('selectedYear', year);
    },
  },

  save: task(function* () {
    this.set('isSaving', true);
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['name']);
    const {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      this.set('isSaving', false);
      return;
    }
    const reportId = this.get('report.id');
    const year = this.selectedYear.get('id');
    const description = this.description;
    const name = this.name;
    const data = {
      name,
      description,
      year,
    };

    const url = `${this.namespace}/curriculuminventoryreports/${reportId}/rollover`;
    const newReportObj = yield this.fetch.postToApiHost(url, data);

    const flashMessages = this.flashMessages;
    const store = this.store;
    flashMessages.success('general.curriculumInventoryReportRolloverSuccess');
    store.pushPayload(newReportObj);
    const newReport = store.peekRecord('curriculum-inventory-report', newReportObj.curriculumInventoryReports[0].id);

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
