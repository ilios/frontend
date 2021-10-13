import Service, { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default class ApiVersionService extends Service {
  @service iliosConfig;

  get version() {
    const { apiVersion } = getOwner(this).resolveRegistration('config:environment');

    return apiVersion;
  }

  async getIsMismatched() {
    const serverApiVersion = await this.iliosConfig.getApiVersion();
    return serverApiVersion !== this.version;
  }
}
