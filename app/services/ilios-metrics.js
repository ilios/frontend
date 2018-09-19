import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
const { scheduleOnce } = run;
const { Promise } = RSVP;

export default Service.extend({
  metrics: service(),
  currentUser: service(),
  iliosConfig: service(),

  setup(){
    const iliosConfig = this.iliosConfig;
    const metrics = this.metrics;
    return new Promise(resolve => {
      iliosConfig.get('trackingEnabled').then(trackingEnabled => {
        iliosConfig.get('trackingCode').then(trackingCode => {
          if (!trackingEnabled || isEmpty(trackingCode)) {
            resolve(false);
          } else {
            metrics.activateAdapters([
              {
                name: 'GoogleAnalytics',
                environments: ['all'],
                config: {
                  id: trackingCode
                }
              }
            ]);
            resolve(true);
          }
        });
      });
    });
  },

  track(page, title) {
    scheduleOnce('afterRender', this, () => {
      this.setup().then(setupSuccessful => {
        if (setupSuccessful) {
          const metrics = this.metrics;
          const currentUser = this.currentUser;
          currentUser.get('model').then(user => {
            if (user) {
              metrics.set('context.userId', user.get('id'));
            }
            metrics.trackPage({ page, title });
          });
        }

      });

    });
  }
});
