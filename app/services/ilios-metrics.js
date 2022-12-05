import Service, { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { isEmpty } from '@ember/utils';

export default Service.extend({
  metrics: service(),
  currentUser: service(),
  iliosConfig: service(),

  async setup() {
    const iliosConfig = this.iliosConfig;
    const metrics = this.metrics;
    const trackingEnabled = await iliosConfig.getTrackingEnabled();
    const trackingCode = await iliosConfig.getTrackingCode();

    if (!trackingEnabled || isEmpty(trackingCode)) {
      return false;
    } else {
      metrics.activateAdapters([
        {
          name: 'GoogleAnalytics',
          environments: ['all'],
          config: { id: trackingCode },
        },
      ]);
      return true;
    }
  },

  track(page, title) {
    const setContext = async () => {
      const setupSuccessful = await this.setup();
      if (setupSuccessful) {
        const metrics = this.metrics;
        const user = await this.currentUser.getModel();
        if (user) {
          metrics.set('context.userId', user.id);
        }
        metrics.trackPage({ page, title });
      }
    };
    scheduleOnce('afterRender', this, setContext);
  },
});
