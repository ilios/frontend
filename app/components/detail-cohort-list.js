import Ember from 'ember';

const { Component, computed, Object:EmberObject, RSVP, inject, isEmpty } = Ember;
const { map } = RSVP;
const { service } = inject;

export default Component.extend({
  i18n: service(),
  cohorts: [],
  /**
   * A list of cohorts, sorted by school and display title.
   * @property sortedCohorts
   * @type {Ember.computed}
   * @public
   */
  sortedCohorts: computed('cohorts.[]', async function(){
    const cohorts = this.get('cohorts');
    const sortProxies = await map(cohorts.toArray(), async cohort => {
      const school = await cohort.get('school');
      const schoolTitle = school.get('title');
      let displayTitle = cohort.get('title');
      if (isEmpty(displayTitle)) {
        const i18n = this.get('i18n');
        const classOfYear = await cohort.get('classOfYear');

        displayTitle = i18n.t('general.classOf', {year: classOfYear});
      }

      return EmberObject.create({
        cohort,
        schoolTitle,
        displayTitle,
      });
    });

    return sortProxies.sortBy('schoolTitle', 'displayTitle').mapBy('cohort');
  }),
});
