/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import layout from '../templates/components/detail-cohort-list';
import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
const { map } = RSVP;

export default Component.extend({
  layout,
  intl: service(),
  classNames: ['detail-cohort-list'],
  cohorts: null,
  /**
   * A list of cohorts, sorted by school and display title.
   * @property sortedCohorts
   * @type {Ember.computed}
   * @public
   */
  sortedCohorts: computed('cohorts.[]', async function(){
    const cohorts = this.get('cohorts');
    if (isEmpty(cohorts)) {
      return [];
    }
    const sortProxies = await map(cohorts.toArray(), async cohort => {
      const school = await cohort.get('school');
      const schoolTitle = school.get('title');
      let displayTitle = cohort.get('title');
      if (isEmpty(displayTitle)) {
        const intl = this.get('intl');
        const classOfYear = await cohort.get('classOfYear');
        displayTitle = intl.t('general.classOf', {year: classOfYear});
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
