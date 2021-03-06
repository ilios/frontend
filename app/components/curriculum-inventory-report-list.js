import Component from '@glimmer/component';
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

  userCanDelete: computed('content', 'content.isFinalized', 'currentUser.model', async function () {
    const report = this.content;
    if (report.isFinalized) {
      return false;
    }
    return this.permissionChecker.canDeleteCurriculumInventoryReport(report);
  }),

  yearLabel: computed('content.year', async function () {
    const crossesYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    if (crossesYearBoundaries) {
      return this.content.year + ' - ' + (parseInt(this.content.year, 10) + 1);
    }
    return this.content.year;
  }),
});

export default class CurriculumInventoryReportListComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service iliosConfig;

  get proxiedReports() {
    if (!this.args.reports) {
      return [];
    }
    return this.args.reports.toArray().map((report) => {
      return ReportProxy.create({
        content: report,
        intl: this.intl,
        currentUser: this.currentUser,
        permissionChecker: this.permissionChecker,
        iliosConfig: this.iliosConfig,
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
  setSortBy(what) {
    if (this.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
}
