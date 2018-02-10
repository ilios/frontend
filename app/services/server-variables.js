import Service from '@ember/service';
import { inject } from '@ember/service';
import { reads } from '@ember/object/computed';

/**
 * In the LTI app we pull server variables out of the session instead
 * of the index.html where it is in the frontend. Instead of using ember-server-variables
 * we can provide this proxy service instead
 * They are needed in the ilios-config service
**/
export default Service.extend({
  session: inject(),
  apiHost: reads('session.data.apiHost'),
  apiNameSpace: reads('session.data.apiNameSpace'),
});
