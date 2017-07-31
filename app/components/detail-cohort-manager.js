import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import EmberObject, { computed } from '@ember/object';

import { translationMacro as t } from "ember-i18n";

const { sort } = computed;
const { all, Promise } = RSVP;

export default Component.extend({
  i18n: service(),
  currentUser: service(),
  tagName: 'section',
  classNames: ['detail-block'],
  placeholder: t('general.filterPlaceholder'),
  filter: '',
  selectedCohorts: null,
  sortBy: ['title'],
  sortedCohorts: sort('selectedCohorts', 'sortBy'),

  /**
   * @property availableCohorts
   * @type {Ember.computed}
   * @protected
   */
  availableCohorts: computed('currentUser.cohortsInAllAssociatedSchools.[]', 'selectedCohorts.[]', function(){
    const currentUser = this.get('currentUser');
    return new Promise(resolve => {
      currentUser.get('cohortsInAllAssociatedSchools').then(usableCohorts => {
        let availableCohorts = usableCohorts.filter(cohort => {
          return (
            this.get('selectedCohorts') && !this.get('selectedCohorts').includes(cohort)
          );
        });
        resolve(availableCohorts);
      });
    });
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
