import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class SchoolController extends Controller {
  queryParams = [
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
    'schoolManageInstitutionalInformation',
    'schoolNewVocabulary',
    'schoolManageEmails',
  ];

  @tracked schoolCompetencyDetails = false;
  @tracked schoolManageCompetencies = false;
  @tracked schoolVocabularyDetails = false;
  @tracked schoolManagedVocabulary = null;
  @tracked schoolManagedVocabularyTerm = null;
  @tracked schoolLeadershipDetails = false;
  @tracked schoolManageLeadership = false;
  @tracked schoolManageSessionAttributes = false;
  @tracked schoolSessionAttributesDetails = false;
  @tracked schoolNewSessionType = false;
  @tracked schoolSessionTypeDetails = false;
  @tracked schoolManagedSessionType = null;
  @tracked schoolManageInstitutionalInformation = false;
  @tracked schoolNewVocabulary = false;
  @tracked schoolManageEmails = false;
}
