import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP, computed, inject } = Ember;
const { service } = inject;
const { Promise } = RSVP;
const { reads } = computed;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  ajax: service(),
  iliosConfig: service(),

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  model(){
    const ajax = this.get('ajax');
    const host = this.get('host');
    const namespace = this.get('namespace');
    return new Promise(resolve => {
      this.get('currentUser').get('model').then(user => {
        const userId = user.get('id');
        let url = `${host}/${namespace}/usermaterials/${userId}`;
        ajax.request(url).then(data => {
          resolve(data.userMaterials);
        });
      });
    });
  },
  setupController: function(){
    this._super(...arguments);
    this.controllerFor('application').set('pageTitleTranslation', 'general.learningMaterials');
  },
});
