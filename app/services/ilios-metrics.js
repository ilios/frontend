import Ember from 'ember';

const { Service, RSVP, run, isEmpty } = Ember;
const { scheduleOnce } = run;
const { Promise } = RSVP;

export default Service.extend({
  metrics: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  iliosConfig: Ember.inject.service(),

  setup(){
    const iliosConfig = this.get('iliosConfig');
    const metrics = this.get('metrics');
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
          const metrics = this.get('metrics');
          const currentUser = this.get('currentUser');
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
