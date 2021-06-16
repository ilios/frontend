import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CurriculumInventoryReportController extends Controller {
  queryParams = ['leadershipDetails', 'manageLeadership'];

  @tracked leadershipDetails = false;
  @tracked manageLeadership = false;

  @action
  setLeadershipDetails(leadershipDetails) {
    this.leadershipDetails = leadershipDetails;
  }

  @action
  setManageLeadership(manageLeadership) {
    this.manageLeadership = manageLeadership;
  }
}
