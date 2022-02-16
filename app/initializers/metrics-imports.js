import googleAnalyticsAdapter from 'ember-metrics/metrics-adapters/google-analytics';

//Workaround for https://github.com/adopted-ember-addons/ember-metrics/issues/316
//We'll probably ditch this whole thign soon so I'm ok with this small hack
export function initialize(application) {
  console.log(googleAnalyticsAdapter);
  application.register('metrics-adapter:GoogleAnalytics', googleAnalyticsAdapter);
}

export default {
  initialize,
};
