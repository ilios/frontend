import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class SessionIndexController extends Controller {
  queryParams = [
    'sessionObjectiveDetails',
    'sessionTaxonomyDetails',
    'sessionLeadershipDetails',
    'sessionManageLeadership',
    'addOffering',
  ];
  @tracked sessionObjectiveDetails = false;
  @tracked sessionTaxonomyDetails = false;
  @tracked sessionLeadershipDetails = false;
  @tracked sessionManageLeadership = false;
  @tracked addOffering = false;
}
