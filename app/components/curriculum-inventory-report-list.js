/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import Component from '@ember/component';
const { alias, not } = computed;

const ReportProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  permissionChecker: null,
  showRemoveConfirmation: false,
  i18n: null,
  isPublished: alias('isFinalized'),
  isScheduled: false,
  isNotPublished: not('isPublished'),
  userCanDelete: computed('content', 'content.isFinalized', 'currentUser.model', async function(){
    const permissionChecker = this.permissionChecker;
    const report = this.content;
    if (report.get('isFinalized')) {
      return false;
    }
    return permissionChecker.canDeleteCurriculumInventoryReport(report);
  }),
});

export default Component.extend({
  currentUser: service(),
  i18n: service(),
  permissionChecker: service(),
  program: null,

  /**
   * @property proxiedReports
   * @type {Ember.computed}
   * @public
   */
  proxiedReports: computed('program.curriculumInventoryReports.[]', async function () {
    const currentUser = this.currentUser;
    const i18n = this.i18n;
    const permissionChecker = this.permissionChecker;
    const program = this.program;

    const reports = await program.get('curriculumInventoryReports');
    return reports.map(report => {
      return ReportProxy.create({
        content: report,
        i18n,
        currentUser,
        permissionChecker,
      });
    });
  }),

  sortBy: 'title',
  sortedAscending: computed('sortBy', function(){
    const sortBy = this.sortBy;
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
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
  }
});
