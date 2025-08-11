import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SchoolRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service session;
  @service store;
  @service dataLoader;

  canUpdateSchool = false;
  canUpdateCompetency = false;
  canDeleteCompetency = false;
  canCreateCompetency = false;
  canUpdateVocabulary = false;
  canDeleteVocabulary = false;
  canCreateVocabulary = false;
  canUpdateTerm = false;
  canDeleteTerm = false;
  canCreateTerm = false;
  canUpdateSessionType = false;
  canDeleteSessionType = false;
  canCreateSessionType = false;
  canUpdateSchoolConfig = false;

  #preloadPromise;

  queryParams = {
    schoolCompetencyDetails: { replace: true },
    schoolManageCompetencies: { replace: true },
    schoolVocabularyDetails: { replace: true },
    schoolManagedVocabulary: { replace: true },
    schoolManagedVocabularyTerm: { replace: true },
    schoolLeadershipDetails: { replace: true },
    schoolManageLeadership: { replace: true },
    schoolManageSessionAttributes: { replace: true },
    schoolSessionAttributesDetails: { replace: true },
    schoolSessionTypeDetails: { replace: true },
    schoolManagedSessionType: { replace: true },
    schoolNewSessionType: { replace: true },
    schoolManageInstitutionalInformation: { replace: true },
    schoolNewVocabulary: { replace: true },
    schoolManageEmails: { replace: true },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model(params) {
    return this.dataLoader.loadSchoolForSchool(params.school_id);
  }

  async afterModel(school) {
    return Promise.all([
      this.loadPermissions(school),
      this.dataLoader.loadSchoolForSchool(school.id),
      this.getPreloadPromise(),
    ]);
  }

  getPreloadPromise() {
    if (!this.#preloadPromise) {
      this.#preloadPromise = Promise.all([
        this.store.findAll('aamc-method'),
        this.store.findAll('assessment-option'),
        this.store.findAll('aamc-pcrs'),
      ]);
    }

    return this.#preloadPromise;
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdateSchool', this.canUpdateSchool);
    controller.set('canUpdateCompetency', this.canUpdateCompetency);
    controller.set('canDeleteCompetency', this.canDeleteCompetency);
    controller.set('canCreateCompetency', this.canCreateCompetency);
    controller.set('canUpdateVocabulary', this.canUpdateVocabulary);
    controller.set('canDeleteVocabulary', this.canDeleteVocabulary);
    controller.set('canCreateVocabulary', this.canCreateVocabulary);
    controller.set('canUpdateTerm', this.canUpdateTerm);
    controller.set('canDeleteTerm', this.canDeleteTerm);
    controller.set('canCreateTerm', this.canCreateTerm);
    controller.set('canUpdateSessionType', this.canUpdateSessionType);
    controller.set('canDeleteSessionType', this.canDeleteSessionType);
    controller.set('canCreateSessionType', this.canCreateSessionType);
    controller.set('canUpdateSchoolConfig', this.canUpdateSchoolConfig);
  }

  async loadPermissions(school) {
    const permissionChecker = this.permissionChecker;

    this.canUpdateSchool = await permissionChecker.canUpdateSchool(school);
    this.canUpdateCompetency = await permissionChecker.canUpdateCompetencyInSchool(school);
    this.canDeleteCompetency = await permissionChecker.canDeleteCompetencyInSchool(school);
    this.canCreateCompetency = await permissionChecker.canCreateCompetency(school);
    this.canUpdateVocabulary = await permissionChecker.canUpdateVocabularyInSchool(school);
    this.canDeleteVocabulary = await permissionChecker.canDeleteVocabularyInSchool(school);
    this.canCreateVocabulary = await permissionChecker.canCreateVocabulary(school);
    this.canUpdateTerm = await permissionChecker.canUpdateTermInSchool(school);
    this.canDeleteTerm = await permissionChecker.canDeleteTermInSchool(school);
    this.canCreateTerm = await permissionChecker.canCreateTerm(school);
    this.canUpdateSessionType = await permissionChecker.canUpdateSessionTypeInSchool(school);
    this.canDeleteSessionType = await permissionChecker.canDeleteSessionTypeInSchool(school);
    this.canCreateSessionType = await permissionChecker.canCreateSessionType(school);
    this.canUpdateSchoolConfig = await permissionChecker.canUpdateSchoolConfig(school);
  }
}
