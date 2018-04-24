import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

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
    controller.set('canUpdateSchool', this.get('canUpdateSchool'));
    controller.set('canUpdateCompetency', this.get('canUpdateCompetency'));
    controller.set('canDeleteCompetency', this.get('canDeleteCompetency'));
    controller.set('canCreateCompetency', this.get('canCreateCompetency'));
    controller.set('canUpdateVocabulary', this.get('canUpdateVocabulary'));
    controller.set('canDeleteVocabulary', this.get('canDeleteVocabulary'));
    controller.set('canCreateVocabulary', this.get('canCreateVocabulary'));
    controller.set('canUpdateTerm', this.get('canUpdateTerm'));
    controller.set('canDeleteTerm', this.get('canDeleteTerm'));
    controller.set('canCreateTerm', this.get('canCreateTerm'));
    controller.set('canUpdateSessionType', this.get('canUpdateSessionType'));
    controller.set('canDeleteSessionType', this.get('canDeleteSessionType'));
    controller.set('canCreateSessionType', this.get('canCreateSessionType'));
    controller.set('canUpdateSchoolConfig', this.get('canUpdateSchoolConfig'));
  },
  async loadPermissions(school) {
    const permissionChecker = this.get('permissionChecker');
    let canUpdateSchool = true;
    let canUpdateCompetency = true;
    let canDeleteCompetency = true;
    let canCreateCompetency = true;
    let canUpdateVocabulary = true;
    let canDeleteVocabulary = true;
    let canCreateVocabulary = true;
    let canUpdateTerm = true;
    let canDeleteTerm = true;
    let canCreateTerm = true;
    let canUpdateSessionType = true;
    let canDeleteSessionType = true;
    let canCreateSessionType = true;
    let canUpdateSchoolConfig = true;
    if (enforceRelationshipCapabilityPermissions) {
      canUpdateSchool = await permissionChecker.canUpdateSchool(school);
      canUpdateCompetency = await permissionChecker.canUpdateCompetencyInSchool(school);
      canDeleteCompetency = await permissionChecker.canDeleteCompetencyInSchool(school);
      canCreateCompetency = await permissionChecker.canCreateCompetency(school);
      canUpdateVocabulary = await permissionChecker.canUpdateVocabularyInSchool(school);
      canDeleteVocabulary = await permissionChecker.canDeleteVocabularyInSchool(school);
      canCreateVocabulary = await permissionChecker.canCreateVocabulary(school);
      canUpdateTerm = await permissionChecker.canUpdateTermInSchool(school);
      canDeleteTerm = await permissionChecker.canDeleteTermInSchool(school);
      canCreateTerm = await permissionChecker.canCreateTerm(school);
      canUpdateSessionType = await permissionChecker.canUpdateSessionTypeInSchool(school);
      canDeleteSessionType = await permissionChecker.canDeleteSessionTypeInSchool(school);
      canCreateSessionType = await permissionChecker.canCreateSessionType(school);
      canUpdateSchoolConfig = await permissionChecker.canUpdateSchoolConfig(school);
    }

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
