import Ember from 'ember';
import DS from 'ember-data';

const { computed, Controller } = Ember;
const { PromiseObject } = DS;

export default Controller.extend({
  secondaryCohorts: computed('model', {
    get() {
      const model = this.get('model');

      const cohorts = model.get('cohorts').then((cohorts) => {
        return model.get('primaryCohort').then((primaryCohort) => {
          return cohorts.removeObject(primaryCohort);
        });
      });

      return PromiseObject.create({
        promise: cohorts
      });
    }
  }).readOnly()
});
