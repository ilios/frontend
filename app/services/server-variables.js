import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * In the LTI app we pull server variables out of the session instead
 * of the index.html where it is in the frontend. Instead of using ember-server-variables
 * we can provide this proxy service instead
 * They are needed in the ilios-config service
 */
export default class ServerVariablesService extends Service {
  @tracked apiHost;
  @tracked apiNameSpace;

  setApiVariables(apiHost, apiNameSpace) {
    this.apiHost = apiHost.replace(/\/+$/, '');
    this.apiNameSpace = apiNameSpace.replace(/\/+$/, '');
  }
}
