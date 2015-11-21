import Ember from 'ember';

const { computed, Controller, PromiseProxyMixin } = Ember;
const ProxyContent = Ember.Object.extend(PromiseProxyMixin);

export default Controller.extend({
  secondaryCohorts: computed('model', {
    get() {
      const model = this.get('model');

      const cohorts = model.get('cohorts').then((cohorts) => {
        model.get('primaryCohort').then((primaryCohort) => {
          return cohorts.removeObject(primaryCohort);
        });
      });

      return ProxyContent.create({
        promise: cohorts
      });
    }
  }).readOnly()
});
