import Component from '@ember/component';
import ObjectProxy from '@ember/object/proxy';
import { computed } from '@ember/object';
import { alias, not } from '@ember/object/computed';
import { inject as service } from '@ember/service';

const ReportProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  intl: null,
  isScheduled: false,
  permissionChecker: null,
  showRemoveConfirmation: false,

  isNotPublished: not('isPublished'),
  isPublished: alias('isFinalized'),

  userCanDelete: computed('content', 'content.isFinalized', 'currentUser.model', async function() {
    const permissionChecker = this.permissionChecker;
    const report = this.content;
    if (report.get('isFinalized')) {
      return false;
    }
    return permissionChecker.canDeleteCurriculumInventoryReport(report);
  })
});

export default Component.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),
  tagName: "",
  program: null,
  sortBy: 'title',
  edit() {},
  remove() {},
  setSortBy() {},

  /**
   * @property proxiedReports
   * @type {Ember.computed}
   * @public
   */
  proxiedReports: computed('program.curriculumInventoryReports.[]', async function () {
    const currentUser = this.currentUser;
    const intl = this.intl;
    const permissionChecker = this.permissionChecker;
    const program = this.program;
    const reports = await program.get('curriculumInventoryReports');
    return reports.map(report => {
      return ReportProxy.create({
        content: report,
        intl,
        currentUser,
        permissionChecker
      });
    });
  }),

  sortedAscending: computed('sortBy', function() {
    return this.sortBy.search(/desc/) === -1;
  }),

  actions: {
    edit(proxy) {
      this.edit(proxy.get('content'));
    },

    remove(proxy) {
      this.remove(proxy.get('content'));
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
    }
  }
});
