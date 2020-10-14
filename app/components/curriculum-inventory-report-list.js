import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ObjectProxy from '@ember/object/proxy';
import { action, computed } from '@ember/object';
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
    const report = this.content;
    if (report.isFinalized) {
      return false;
    }
    return this.permissionChecker.canDeleteCurriculumInventoryReport(report);
  })
});

export default class CurriculumInventoryReportListComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @tracked proxiedReports;

  @action
  load(element, [ reports ]) {
    if (! reports) {
      this.proxiedReports = [];
      return;
    }
    this.proxiedReports = reports.toArray().map(report => {
      return ReportProxy.create({
        content: report,
        intl: this.intl,
        currentUser: this.currentUser,
        permissionChecker: this.permissionChecker
      });
    });
  }

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  get sortBy() {
    return this.args.sortBy || 'name';
  }

  @action
  edit(proxy) {
    this.args.edit(proxy.get('content'));
  }

  @action
  remove(proxy) {
    this.args.remove(proxy.get('content'));
  }

  @action
  cancelRemove(proxy) {
    proxy.set('showRemoveConfirmation', false);
  }

  @action
  confirmRemove(proxy) {
    proxy.set('showRemoveConfirmation', true);
  }

  @action
  setSortBy(what){
    if(this.sortBy === what){
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
}
