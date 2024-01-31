import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ProgramController extends Controller {
  queryParams = ['leadershipDetails', 'manageLeadership'];
  @tracked leadershipDetails = false;
  @tracked manageLeadership = false;
}
