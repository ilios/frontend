import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';


export default Component.extend({
  fetch: service(),
  iliosConfig: service(),
  'data-test-curriculum-inventory-verification-preview': true,
  classNames: ['curriculum-inventory-verification-preview'],
  report: null,
  tables: null,
  tocId: 'verification-preview-toc',
  namespace: reads('iliosConfig.apiNameSpace'),

  didInsertElement() {
    this._super(...arguments);
    this.loadTables.perform();
  },

  loadTables: task(function* () {
    const reportId = this.report.id;

    const url = `${this.namespace}/curriculuminventoryreports/${reportId}/verificationpreview`;
    const data = yield this.fetch.getJsonFromApiHost(url);
    this.set('tables', data.preview);
  })
});
