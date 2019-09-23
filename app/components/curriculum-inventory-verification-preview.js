import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Component.extend({
  commonAjax: service(),
  iliosConfig: service(),
  classNames: ['curriculum-inventory-verification-preview'],
  report: null,
  tocId: 'verification-preview-toc',
  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  tables: computed('host', 'namespace', 'report', async function() {
    const commonAjax = this.commonAjax;
    const reportId = this.get('report.id');
    const host = this.host ? this.host : '';
    const namespace = this.namespace;

    const url = host + '/' + namespace + `/curriculuminventoryreports/${reportId}/verificationpreview`;
    const data = await commonAjax.request(url);
    return data.preview;
  })
});
