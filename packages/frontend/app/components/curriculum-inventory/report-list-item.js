import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { service } from '@ember/service';

export default class CurriculumInventoryReportListItemComponent extends Component {
  @service iliosConfig;
  @service permissionChecker;
  @tracked showConfirmRemoval;
  isFinalized = this.args.report.belongsTo('export').id();
  academicYearConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteCurriculumInventoryReport(this.args.report),
    );
  }

  get canDelete() {
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

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
