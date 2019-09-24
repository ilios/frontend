import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';


export default Component.extend({
  commonAjax: service(),
  iliosConfig: service(),
  classNames: ['curriculum-inventory-verification-preview'],
  report: null,
  tables: null,
  tocId: 'verification-preview-toc',
  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  didInsertElement() {
    this._super(...arguments);
    this.loadTables.perform();
  },

  loadTables: task(function* () {
    const commonAjax = this.commonAjax;
    const reportId = this.report.id;
    const host = this.host ? this.host : '';
    const namespace = this.namespace;

    const url = host + '/' + namespace + `/curriculuminventoryreports/${reportId}/verificationpreview`;
    const data = yield commonAjax.request(url);
    this.set('tables', data.preview);
  })
});
