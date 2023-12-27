import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { service } from '@ember/service';

export default class CurriculumInventoryReportListItemComponent extends Component {
  @service iliosConfig;
  @service permissionChecker;
  @tracked showConfirmRemoval;
  isFinalized = this.args.report.belongsTo('export').id();
  academicYearConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @use canDelete = new PermissionChecker(() => [
    'canDeleteCurriculumInventoryReport',
    this.args.report,
  ]);

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearConfig.isResolved ? this.academicYearConfig.value : null;
  }

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.args.report.year + ' - ' + (parseInt(this.args.report.year, 10) + 1);
    }
    return this.args.report.year;
  }
}
