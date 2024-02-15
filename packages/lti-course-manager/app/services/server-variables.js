import Service from '@ember/service';
import { inject as service } from '@ember/service';

/**
 * In the LTI app we pull server variables out of the session instead
 * of the index.html where it is in the frontend. Instead of using ember-server-variables
 * we can provide this proxy service instead
 * They are needed in the ilios-config service
 **/
export default class ServerVariablesService extends Service {
  @service session;

  get apiHost() {
    return this.session.data.apiHost;
  }
  get apiNameSpace() {
    return this.session.data.apiNameSpace;
  }
}
