import Controller from '@ember/controller';

export default class SessionIndexController extends Controller {
  queryParams = [
    'sessionObjectiveDetails',
    'sessionTaxonomyDetails',
    'isManagingLearnerGroups',
    'sessionLearnergroupDetails',
    'sessionLeadershipDetails',
    'sessionManageLeadership',
    'addOffering',
  ];
  sessionObjectiveDetails = false;
  sessionTaxonomyDetails = false;
  isManagingLearnerGroups = false;
  sessionLearnergroupDetails = false;
  sessionLeadershipDetails = false;
  sessionManageLeadership = false;
  showNewOfferingForm = false;
  addOffering = false;
}
