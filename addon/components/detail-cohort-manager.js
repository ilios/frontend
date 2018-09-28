/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import layout from '../templates/components/detail-cohort-manager';

import Component from '@ember/component';
import { map, filter } from 'rsvp';
import { computed } from '@ember/object';

import { translationMacro as t } from "ember-i18n";

export default Component.extend({
  layout,
  i18n: service(),
  store: service(),
  permissionChecker: service(),
  tagName: 'section',
  classNames: ['detail-cohort-manager'],
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  school: null,
  selectedCohorts: null,

  allCohorts: computed('school', async function () {
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const allCohorts = await store.findAll('cohort');
    const courseSchool = this.get('school');

    return filter(allCohorts.toArray(), async cohort => {
      const cohortSchool = await cohort.get('school');
      if (cohortSchool === courseSchool) {
        return true;
      }
      if (await permissionChecker.canUpdateAllCoursesInSchool(cohortSchool)) {
        return true;
      }
      const programYear = await cohort.get('programYear');
      if (await permissionChecker.canUpdateProgramYear(programYear)) {
        return true;
      }

      return false;
    });
  }),

  /**
   * @property availableCohorts
   * @type {Ember.computed}
   * @protected
   */
  availableCohorts: computed('allCohorts.[]', 'selectedCohorts.[]', async function(){
    const cohorts = await this.get('allCohorts');
    const selectedCohorts = this.get('selectedCohorts') || [];

    return cohorts.filter(cohort => !selectedCohorts.includes(cohort));
  }),

  /**
   * All available cohorts, sorted by:
   *
   * 1. owning school's title, ascending
   * 2. owning program's title, ascending
   * 3. cohort title, descending
   *
   * @property sortedAvailableCohorts
   * @type {Ember.computed}
   * @public
   */
  sortedAvailableCohorts: computed('availableCohorts.[]', async function () {
    const availableCohorts = await this.get('availableCohorts');
    const objects = await map(availableCohorts, async cohort => {
      const programYear = await cohort.get('programYear');
      const program = await programYear.get('program');
      const school = await program.get('school');

      const sortTitle = school.get('title') + program.get('title');

      return {
        cohort,
        sortTitle,
        cohortTitle: cohort.get('title')
      };
    });

    objects.sort((obj1, obj2) => {
      let compare = obj1.sortTitle.localeCompare(obj2.sortTitle);
      if (compare === 0) {
        //cohort titles are sorted descending
        compare = -obj1.cohortTitle.localeCompare(obj2.cohortTitle);
      }

      return compare;

    });

    return objects.mapBy('cohort');
  }),

  actions: {
    add(cohort) {
      this.sendAction('add', cohort);
    },
    remove(cohort) {
      this.sendAction('remove', cohort);
    }
  }
});
