import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios-common/mixins/sortable-objective-list';
import { task } from 'ember-concurrency';
import fetch from 'fetch';

const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  ajax: service(),
  iliosConfig: service(),
  session:service(),
  tagName: "",
  editable: false,
  isDownloading: false,
  subject: null,
  expandedObjectiveIds: null,
  programYear: alias('subject'),

  authHeaders: computed('session.isAuthenticated', function(){
    const session = this.session;
    const { jwt } = session.data.authenticated;
    const headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return new Headers(headers);
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
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const resourcePath = '/programyears/' + subject.get('id') + '/downloadobjectivesmapping';
    const host = this.iliosConfig.get('apiHost')?this.iliosConfig.get('apiHost'):window.location.protocol + '//' + window.location.host;
    const url = host + apiPath + resourcePath;
    const { saveAs } = yield import('file-saver');

    this.set('isDownloading', true);
    const response = yield fetch(url, {
      headers: this.authHeaders
    });
    const blob = yield response.blob();
    saveAs(blob, 'report.csv');

    this.set('isDownloading', false);
  }).drop(),
});
