import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';
import { task } from 'ember-concurrency';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';

const { alias } = computed;

export default Component.extend(FileSaverMixin, SortableObjectiveList, {
  ajax: service(),
  iliosConfig: service(),
  session:service(),
  classNames: ['programyear-objective-list'],
  editable: false,
  isDownloading: false,
  subject: null,
  expandedObjectiveIds: null,
  programYear: alias('subject'),

  authHeaders: computed('session.isAuthenticated', function(){
    const session = this.session;
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return headers;
  }),

  init() {
    this._super(...arguments);
    this.set('expandedObjectiveIds', []);
  },

  actions: {
    toggleExpand(objectiveId) {
      const expandedObjectiveIds = this.expandedObjectiveIds;
      if (expandedObjectiveIds.includes(objectiveId)) {
        expandedObjectiveIds.removeObject(objectiveId);
      } else {
        expandedObjectiveIds.pushObject(objectiveId);
      }
      this.set('expandedObjectiveIds', expandedObjectiveIds);
    }
  },

  downloadReport: task(function * (subject) {
    const ajax = this.ajax;
    const config = this.iliosConfig;
    const apiPath = '/' + config.get('apiNameSpace');
    const resourcePath = '/programyears/' + subject.get('id') + '/downloadobjectivesmapping';
    const host = config.get('apiHost')?config.get('apiHost'):window.location.protocol + '//' + window.location.host;
    const url = host + apiPath + resourcePath;
    const authHeaders = this.authHeaders;

    this.set('isDownloading', true);
    const content = yield ajax.request(url, {
      method: 'GET',
      dataType: 'arraybuffer',
      processData: false,
      headers: authHeaders
    });
    this.saveFileAs('report.csv', content, 'text/csv');
    this.set('isDownloading', false);
  }).drop(),
});
