import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: [
    'schoolCompetencyDetails',
    'schoolManageCompetencies',
    'schoolVocabularyDetails',
    'schoolManagedVocabulary',
    'schoolManagedVocabularyTerm',
    'schoolLeadershipDetails',
    'schoolManageLeadership',
    'schoolManageSessionAttributes',
    'schoolSessionAttributesDetails',
    'schoolSessionTypeDetails',
    'schoolManagedSessionType',
    'schoolNewSessionType',
    'schoolManageInstitution'
  ],
  schoolCompetencyDetails: false,
  schoolManageCompetencies: false,
  schoolVocabularyDetails: false,
  schoolManagedVocabulary: null,
  schoolManagedVocabularyTerm: null,
  schoolLeadershipDetails: false,
  schoolManageLeadership: false,
  schoolManageSessionAttributes: false,
  schoolSessionAttributesDetails: false,
  schoolNewSessionType: false,
  schoolSessionTypeDetails: false,
  schoolManagedSessionType: null,
  schoolManageInstitution: false,
});
