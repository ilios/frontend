/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { reads } = computed;

const Validations = buildValidations({
  name: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  commonAjax: service(),
  store: service(),
  flashMessages: service(),
  iliosConfig: service(),
  didReceiveAttrs(){
    this._super(...arguments);
    const report = this.get('report');
    const thisYear = parseInt(moment().format('YYYY'), 10);
    const reportYear = parseInt(report.get('year'), 10);
    const startYear = Math.min(thisYear, reportYear);
    const endYear = Math.max(thisYear, reportYear) + 5;
    let years = [];
    for (let i = startYear; i < endYear; i++) {
      let title = i + ' - ' + (i + 1);
      let year = EmberObject.create({ 'id': i, 'title': title });
      years.pushObject(year);
    }
    const selectedYear = years.findBy('id', startYear + 1);

    this.set('name', report.get('name'));
    this.set('description', report.get('description'));
    this.set('selectedYear', selectedYear);
    this.set('years', years);
  },

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  classNames: ['curriculum-inventory-report-rollover'],
  years: null,
  selectedYear: null,
  report: null,
  name: null,
  description: null,
  isSaving: false,

  save: task(function * (){
    this.set('isSaving', true);
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['name']);
    let {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      this.set('isSaving', false);
      return;
    }
    const commonAjax = this.get('commonAjax');
    const reportId = this.get('report.id');
    const year = this.get('selectedYear').get('id');
    const description = this.get('description');
    const name = this.get('name');
    let data = {
      name,
      description,
      year,
    };
    const host = this.get('host') ? this.get('host') : '';
    const namespace = this.get('namespace');

    let url = host + '/' + namespace + `/curriculuminventoryreports/${reportId}/rollover`;
    const newReportObj = yield commonAjax.request(url, {
      method: 'POST',
      data
    });

    const flashMessages = this.get('flashMessages');
    const store = this.get('store');
    flashMessages.success('general.curriculumInventoryReportRolloverSuccess');
    store.pushPayload(newReportObj);
    let newReport = store.peekRecord('curriculum-inventory-report', newReportObj.curriculumInventoryReports[0].id);

    return this.get('visit')(newReport);
  }).drop(),

  actions: {
    changeName(newName){
      this.set('name', newName);
    },
  }
});
