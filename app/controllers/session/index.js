import Ember from 'ember';

const { Controller } = Ember;

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
