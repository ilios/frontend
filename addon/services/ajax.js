import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import AjaxService from 'ember-ajax/services/ajax';

const { reads } = computed;

export default AjaxService.extend({
  iliosConfig: service(),
  session: service(),

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
