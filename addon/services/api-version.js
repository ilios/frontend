import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';
import { deprecate } from '@ember/debug';

export default Service.extend({
  iliosConfig: service(),

  version: computed(function () {
    const { apiVersion } = getOwner(this).resolveRegistration('config:environment');

    return apiVersion;
  }),

  isMismatched: computed('iliosConfig.apiVersion', 'version', async function () {
    deprecate('Async Computed Called', false, {id: 'common.async-computed', until: '40'});
    const serverApiVersion = await this.iliosConfig.getApiVersion();
    return serverApiVersion !== this.version;
  }),

  async getIsMismatched() {
    const serverApiVersion = await this.iliosConfig.getApiVersion();
    return serverApiVersion !== this.version;
  }
});
