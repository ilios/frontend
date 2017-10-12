import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    sessionObjectiveDetails: 'sessionObjectiveDetails',
    sessionTaxonomyDetails: 'sessionTaxonomyDetails',
    isManagingLearnerGroups: 'isManagingLearnerGroups',
    sessionLearnergroupDetails: 'sessionLearnergroupDetails',
    showNewOfferingForm: 'addOffering',
  },
  sessionObjectiveDetails: false,
  sessionTaxonomyDetails: false,
  isManagingLearnerGroups: false,
  sessionLearnergroupDetails: false,
  showNewOfferingForm: false,
});
