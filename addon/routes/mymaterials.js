import Route from '@ember/routing/route';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { task } from 'ember-concurrency';

export default Route.extend(AuthenticatedRouteMixin, {
  commonAjax: service(),
  currentUser: service(),
  iliosConfig: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),

  model() {
    return this.fetchModelData.perform();
  },

  fetchModelData: task(function* () {
    const commonAjax = this.commonAjax;
    const host = this.host;
    const namespace = this.namespace;
    const user = yield this.currentUser.model;
    const url = `${host}/${namespace}/usermaterials/${user.id}`;
    const data = yield commonAjax.request(url);
    return data.userMaterials;
  }).cancelOn('deactivate')
});
