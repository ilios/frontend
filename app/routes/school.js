import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.schools',
  canUpdateSchool: false,
  canUpdateCompetency: false,
  canDeleteCompetency: false,
  canCreateCompetency: false,
  canUpdateVocabulary: false,
  canDeleteVocabulary: false,
  canCreateVocabulary: false,
  canUpdateTerm: false,
  canDeleteTerm: false,
  canCreateTerm: false,
  canUpdateSessionType: false,
  canDeleteSessionType: false,
  canCreateSessionType: false,
  canUpdateSchoolConfig: false,
  async afterModel(school) {
    await this.loadPermissions(school);

    //preload relationships to improve the user experience
    return hash(school.getProperties(
      'administrators',
      'competencies',
      'configurations',
      'directors',
      'sessionTypes',
      'vocabularies')
    );
  },
  setupController(controller, model) {
    this._super(controller, model);
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
  },
  async loadPermissions(school) {
    const permissionChecker = this.permissionChecker;

    const canUpdateSchool = await permissionChecker.canUpdateSchool(school);
    const canUpdateCompetency = await permissionChecker.canUpdateCompetencyInSchool(school);
    const canDeleteCompetency = await permissionChecker.canDeleteCompetencyInSchool(school);
    const canCreateCompetency = await permissionChecker.canCreateCompetency(school);
    const canUpdateVocabulary = await permissionChecker.canUpdateVocabularyInSchool(school);
    const canDeleteVocabulary = await permissionChecker.canDeleteVocabularyInSchool(school);
    const canCreateVocabulary = await permissionChecker.canCreateVocabulary(school);
    const canUpdateTerm = await permissionChecker.canUpdateTermInSchool(school);
    const canDeleteTerm = await permissionChecker.canDeleteTermInSchool(school);
    const canCreateTerm = await permissionChecker.canCreateTerm(school);
    const canUpdateSessionType = await permissionChecker.canUpdateSessionTypeInSchool(school);
    const canDeleteSessionType = await permissionChecker.canDeleteSessionTypeInSchool(school);
    const canCreateSessionType = await permissionChecker.canCreateSessionType(school);
    const canUpdateSchoolConfig = await permissionChecker.canUpdateSchoolConfig(school);

    this.set('canUpdateSchool', canUpdateSchool);
    this.set('canUpdateCompetency', canUpdateCompetency);
    this.set('canDeleteCompetency', canDeleteCompetency);
    this.set('canCreateCompetency', canCreateCompetency);
    this.set('canUpdateVocabulary', canUpdateVocabulary);
    this.set('canDeleteVocabulary', canDeleteVocabulary);
    this.set('canCreateVocabulary', canCreateVocabulary);
    this.set('canUpdateTerm', canUpdateTerm);
    this.set('canDeleteTerm', canDeleteTerm);
    this.set('canCreateTerm', canCreateTerm);
    this.set('canUpdateSessionType', canUpdateSessionType);
    this.set('canDeleteSessionType', canDeleteSessionType);
    this.set('canCreateSessionType', canCreateSessionType);
    this.set('canUpdateSchoolConfig', canUpdateSchoolConfig);
  }
});
