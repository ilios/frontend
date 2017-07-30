import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP, computed} = Ember;
const { Promise } = RSVP;
const { reads } = computed;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: Ember.inject.service(),
  commonAjax: Ember.inject.service(),
  iliosConfig: Ember.inject.service(),
  titleToken: 'general.learningMaterials',

  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  model(){
    const commonAjax = this.get('commonAjax');
    const host = this.get('host');
    const namespace = this.get('namespace');
    return new Promise(resolve => {
      this.get('currentUser').get('model').then(user => {
        const userId = user.get('id');
        let url = `${host}/${namespace}/usermaterials/${userId}`;
        commonAjax.request(url).then(data => {
          resolve(data.userMaterials);
        });
      });
    });
  },
});
