import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryReportRolloverController extends Controller {
  queryParams = ['leadershipDetails', 'manageLeadership'];
  @tracked hasUpdatePermissions = false;
  @tracked leadershipDetails = false;
  @tracked manageLeadership = false;
  @tracked isFinalized = this.model.belongsTo('export').id();

  get canUpdate() {
    return this.hasUpdatePermissions && !this.isFinalized;
  }

  @action
  loadReport(newReport) {
    this.transitionToRoute('curriculumInventoryReport', newReport);
  }
}
