import Mixin from '@ember/object/mixin';

export default Mixin.create({
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
