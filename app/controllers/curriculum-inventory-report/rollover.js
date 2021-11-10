import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryReportRolloverController extends Controller {
  queryParams = ['leadershipDetails', 'manageLeadership'];
  @tracked hasUpdatePermissions = false;
  @tracked leadershipDetails = false;
  @tracked manageLeadership = false;
  @tracked isFinalized = true;

  get canUpdate() {
    return this.hasUpdatePermissions && !this.isFinalized;
  }

  @action
  setLeadershipDetails(leadershipDetails) {
    this.leadershipDetails = leadershipDetails;
  }

  @action
  setManageLeadership(manageLeadership) {
    this.manageLeadership = manageLeadership;
  }

  @action
  loadReport(newReport) {
    this.transitionToRoute('curriculumInventoryReport', newReport);
  }
}
