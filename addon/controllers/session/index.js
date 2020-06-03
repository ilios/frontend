import Controller from '@ember/controller';

export default class SessionIndexController extends Controller {
  queryParams = [
    'sessionObjectiveDetails',
    'sessionTaxonomyDetails',
    'isManagingLearnerGroups',
    'sessionLeadershipDetails',
    'sessionManageLeadership',
    'addOffering',
  ];
  sessionObjectiveDetails = false;
  sessionTaxonomyDetails = false;
  isManagingLearnerGroups = false;
  sessionLeadershipDetails = false;
  sessionManageLeadership = false;
  showNewOfferingForm = false;
  addOffering = false;
}
