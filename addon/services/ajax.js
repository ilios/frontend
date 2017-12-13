import Ember from 'ember';
import AjaxService from 'ember-ajax/services/ajax';

const { computed } = Ember;
const { reads } = computed;

export default AjaxService.extend({
  iliosConfig: Ember.inject.service(),
  session: Ember.inject.service(),

  host: reads('iliosConfig.apiHost'),

  headers: computed('session.isAuthenticated', 'session.data.authenticated.jwt', function(){
    const session = this.get('session');
    let headers = {};
    session.authorize('authorizer:token', (headerName, headerValue) => {
      headers[headerName] = headerValue;
    });

    return headers;
  }),

});
