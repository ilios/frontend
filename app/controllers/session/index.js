import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    sessionObjectiveDetails: 'sessionObjectiveDetails',
    sessionTaxonomyDetails: 'sessionTaxonomyDetails',
    isManagingLearnerGroups: 'isManagingLearnerGroups',
    sessionLearnergroupDetails: 'sessionLearnergroupDetails',
    sessionLeadershipDetails: 'sessionLeadershipDetails',
    sessionManageLeadership: 'sessionManageLeadership',
    showNewOfferingForm: 'addOffering',
  },
  sessionObjectiveDetails: false,
  sessionTaxonomyDetails: false,
  isManagingLearnerGroups: false,
  sessionLearnergroupDetails: false,
  sessionLeadershipDetails: false,
  sessionManageLeadership: false,
  showNewOfferingForm: false,
});
