/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { all, filter } from 'rsvp';
import EmberObject, { computed } from '@ember/object';

import { translationMacro as t } from "ember-i18n";

const { sort } = computed;

export default Component.extend({
  i18n: service(),
  store: service(),
  permissionChecker: service(),
  init() {
    this._super(...arguments);
    this.set('sortBy', ['title']);
  },
  tagName: 'section',
  classNames: ['detail-cohort-manager'],
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  school: null,
  selectedCohorts: null,
  sortBy: null,
  sortedCohorts: sort('selectedCohorts', 'sortBy'),

  allCohorts: computed('school', async function () {
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const allCohorts = await store.findAll('cohort', { reload: true });
    const courseSchool = this.get('school');

    return filter(allCohorts.toArray(), async cohort => {
      const cohortSchool = await cohort.get('school');
      if (cohortSchool === courseSchool) {
        return true;
      }
      // @todo HACK here. Until we update common to a version with canUpdateAllCoursesInSchool
      // we have to reach into a permission checker internal method instead.
      if (await permissionChecker.canDoInSchool(cohortSchool, 'CAN_UPDATE_ALL_COURSES')) {
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
  sortedAvailableCohorts: computed('availableCohorts.[]', function() {
    return new Promise(resolve => {
      this.get('availableCohorts').then(cohorts => {
        let promises = [];
        let proxies = [];
        cohorts.forEach(cohort => {
          let proxy = EmberObject.create({
            cohort,
            schoolTitle: null,
            programTitle: null
          });

          proxies.pushObject(proxy);
          promises.pushObject(new Promise(resolve => {
            cohort.get('program').then(program => {
              proxy.set('programTitle', program.get('title'));
              program.get('school').then(school => {
                proxy.set('schoolTitle', school.get('title'));
                resolve();
              });
            });
          }));
        });
        all(promises).then(() => {
          let sortedProxies = proxies.sort((proxy1, proxy2) => {
            // sort by cohort's owning school's title, ascending
            if (proxy1.get('schoolTitle') > proxy2.get('schoolTitle')) {
              return 1;
            } else if (proxy1.get('schoolTitle') < proxy2.get('schoolTitle')) {
              return -1;
            }

            // sort by cohort's owning program's title, ascending
            if (proxy1.get('programTitle') > proxy2.get('programTitle')) {
              return 1;
            } else if (proxy1.get('programTitle') < proxy2.get('programTitle')) {
              return -1;
            }

            let cohort1 = proxy1.get('cohort');
            let cohort2 = proxy2.get('cohort');

            // sort by cohort title, descending
            if (cohort1.get('title') > cohort2.get('title')) {
              return -1;
            } else if (cohort1.get('title') < cohort2.get('title')) {
              return 1;
            }

            // final fallback: sort by id, ascending
            if (cohort1.get('id') > cohort2.get('id')) {
              return 1;
            } else if (cohort1.get('id') < cohort2.get('id')) {
              return -1;
            }

            return 0;
          });

          resolve(sortedProxies.getEach('cohort'));
        });
      });
    });
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
