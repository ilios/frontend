/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import Component from '@ember/component';
import RSVP from 'rsvp';
const { Promise } = RSVP;
const { alias, not } = computed;

const ReportProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  showRemoveConfirmation: false,
  i18n: null,
  isPublished: alias('isFinalized'),
  isScheduled: false,
  isNotPublished: not('isPublished'),
});

export default Component.extend({
  currentUser: service(),
  i18n: service(),
  program: null,

  /**
   * @property proxiedReports
   * @type {Ember.computed}
   * @public
   */
  proxiedReports: computed('program.curriculumInventoryReports.[]', function(){
    return new Promise(resolve => {
      const i18n = this.get('i18n');
      this.get('program').get('curriculumInventoryReports').then(reports => {
        resolve(reports.map(report => {
          return ReportProxy.create({
            content: report,
            i18n,
            currentUser: this.get('currentUser')
          });
        }));
      });
    });
  }),

  sortBy: 'title',
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),
  actions: {
    edit(proxy) {
      this.sendAction('edit', proxy.get('content'));
    },
    remove(proxy) {
      this.sendAction('remove', proxy.get('content'));
    },
    cancelRemove(proxy) {
      proxy.set('showRemoveConfirmation', false);
    },
    confirmRemove(proxy) {
      proxy.set('showRemoveConfirmation', true);
    },
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
