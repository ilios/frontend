import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { capitalize } from '@ember/string';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import or from 'ember-truth-helpers/helpers/or';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import LeadershipExpanded from 'ilios-common/components/leadership-expanded';
import { fn } from '@ember/helper';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import hasManyLength from 'ilios-common/helpers/has-many-length';
import SchoolCompetenciesExpanded from 'frontend/components/school-competencies-expanded';
import SchoolCompetenciesCollapsed from 'frontend/components/school-competencies-collapsed';
import SchoolVocabulariesExpanded from 'frontend/components/school-vocabularies-expanded';
import SchoolVocabulariesCollapsed from 'frontend/components/school-vocabularies-collapsed';
import not from 'ember-truth-helpers/helpers/not';
import SchoolSessionTypesExpanded from 'frontend/components/school-session-types-expanded';
import SchoolSessionTypesCollapsed from 'frontend/components/school-session-types-collapsed';
import SchoolSessionAttributes from 'frontend/components/school-session-attributes';
import EmailsEditor from 'frontend/components/school/emails-editor';
import Emails from 'frontend/components/school/emails';
import SchoolCurriculumInventoryInstitutionManager from 'frontend/components/school-curriculum-inventory-institution-manager';
import SchoolCurriculumInventoryInstitutionDetails from 'frontend/components/school-curriculum-inventory-institution-details';

export default class SchoolManagerComponent extends Component {
  @service flashMessages;
  @tracked title;
  @tracked newSavedSessionType;

  constructor() {
    super(...arguments);
    this.title = this.args.school.title;
  }

  validations = new YupValidations(this, {
    title: string().required().max(60),
  });

  @cached
  get institutionData() {
    return new TrackedAsyncData(this.args.school.curriculumInventoryInstitution);
  }

  get institutionLoaded() {
    return this.institutionData.isResolved;
  }

  get institution() {
    return this.institutionData.isResolved ? this.institutionData.value : null;
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.args.school.sessionTypes);
  }

  get sessionTypesLoaded() {
    return this.sessionTypesData.isResolved;
  }

  get hasSessionTypes() {
    return this.sessionTypesData.isResolved ? !!this.sessionTypesData.value.length : false;
  }

  changeTitle = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

    this.args.school.title = this.title;
    this.newSchool = await this.args.school.save();
    this.flashMessages.success(capitalize('general.savedSuccessfully'));
  });

  @action
  setNewSavedSessionType(sessionType) {
    this.newSavedSessionType = sessionType;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.school.title;
  }

  @action
  async saveInstitution(institution) {
    if (!institution.belongsTo('school').id()) {
      institution.school = this.args.school;
    }
    await institution.save();
  }

  @action
  async saveEmails(administratorEmail, changeAlertRecipients) {
    this.args.school.changeAlertRecipients = changeAlertRecipients;
    this.args.school.iliosAdministratorEmail = administratorEmail;
    await this.args.school.save();
  }
  <template>
    <section class="school-manager" data-test-school-manager ...attributes>
      <div class="backtolink">
        <LinkTo @route="schools">
          {{t "general.backToSchools"}}
        </LinkTo>
      </div>
      <div class="school-overview">
        <h2 data-test-school-title>
          {{#if @canUpdateSchool}}
            <EditableField
              @value={{this.title}}
              @save={{perform this.changeTitle}}
              @close={{this.revertTitleChanges}}
              @saveOnEnter={{true}}
              @closeOnEscape={{true}}
              as |isSaving|
            >
              <input
                aria-label={{t "general.title"}}
                type="text"
                value={{this.title}}
                disabled={{isSaving}}
                {{on "input" (pick "target.value" (set this "title"))}}
                {{this.validations.attach "title"}}
              />
              <YupValidationMessage
                @description={{t "general.title"}}
                @validationErrors={{this.validations.errors.title}}
                data-test-title-validation-error-message
              />
            </EditableField>
          {{else}}
            {{this.title}}
          {{/if}}
        </h2>
      </div>
      <div class="school-manager-content">
        {{#if
          (or
            (and (eq @school.directors.length 0) (eq @school.administrators.length 0))
            @schoolLeadershipDetails
          )
        }}
          <LeadershipExpanded
            @model={{@school}}
            @editable={{@canUpdateSchool}}
            @collapse={{fn @setSchoolLeadershipDetails false}}
            @expand={{fn @setSchoolLeadershipDetails true}}
            @isManaging={{@schoolManageLeadership}}
            @setIsManaging={{@setSchoolManageLeadership}}
          />
        {{else}}
          <LeadershipCollapsed
            @showAdministrators={{true}}
            @showDirectors={{true}}
            @directorsCount={{hasManyLength @school "directors"}}
            @administratorsCount={{hasManyLength @school "administrators"}}
            @expand={{fn @setSchoolLeadershipDetails true}}
          />
        {{/if}}
        {{#if (or (eq @school.competencies.length 0) @schoolCompetencyDetails)}}
          <SchoolCompetenciesExpanded
            @school={{@school}}
            @canUpdate={{@canUpdateCompetency}}
            @canDelete={{@canDeleteCompetency}}
            @canCreate={{@canCreateCompetency}}
            @collapse={{fn @setSchoolCompetencyDetails false}}
            @expand={{fn @setSchoolCompetencyDetails true}}
            @isManaging={{@schoolManageCompetencies}}
            @setSchoolManageCompetencies={{@setSchoolManageCompetencies}}
          />
        {{else}}
          <SchoolCompetenciesCollapsed
            @school={{@school}}
            @expand={{fn @setSchoolCompetencyDetails true}}
          />
        {{/if}}
        {{#if (or (eq @school.vocabularies.length 0) @schoolVocabularyDetails)}}
          <SchoolVocabulariesExpanded
            @school={{@school}}
            @canUpdateVocabulary={{@canUpdateVocabulary}}
            @canDeleteVocabulary={{@canDeleteVocabulary}}
            @canCreateVocabulary={{@canCreateVocabulary}}
            @canUpdateTerm={{@canUpdateTerm}}
            @canDeleteTerm={{@canDeleteTerm}}
            @canCreateTerm={{@canCreateTerm}}
            @collapse={{fn @setSchoolVocabularyDetails false}}
            @expand={{fn @setSchoolVocabularyDetails true}}
            @managedVocabularyId={{@schoolManagedVocabulary}}
            @setSchoolManagedVocabulary={{@setSchoolManagedVocabulary}}
            @managedTermId={{@schoolManagedVocabularyTerm}}
            @setSchoolManagedVocabularyTerm={{@setSchoolManagedVocabularyTerm}}
            @schoolNewVocabulary={{@schoolNewVocabulary}}
            @setSchoolNewVocabulary={{@setSchoolNewVocabulary}}
          />
        {{else}}
          <SchoolVocabulariesCollapsed
            @school={{@school}}
            @expand={{fn @setSchoolVocabularyDetails true}}
          />
        {{/if}}
        {{#if this.sessionTypesLoaded}}
          {{#if (or (not this.hasSessionTypes) @schoolSessionTypeDetails)}}
            <SchoolSessionTypesExpanded
              @school={{@school}}
              @canUpdate={{@canUpdateSessionType}}
              @canDelete={{@canDeleteSessionType}}
              @canCreate={{@canCreateSessionType}}
              @collapse={{fn @setSchoolSessionTypeDetails false}}
              @expand={{fn @setSchoolSessionTypeDetails true}}
              @managedSessionTypeId={{@schoolManagedSessionType}}
              @setSchoolManagedSessionType={{@setSchoolManagedSessionType}}
              @schoolNewSessionType={{@schoolNewSessionType}}
              @setSchoolNewSessionType={{@setSchoolNewSessionType}}
              @newSavedSessionType={{this.newSavedSessionType}}
              @setNewSavedSessionType={{this.setNewSavedSessionType}}
            />
          {{else}}
            <SchoolSessionTypesCollapsed
              @school={{@school}}
              @expand={{fn @setSchoolSessionTypeDetails true}}
            />
          {{/if}}
        {{/if}}
        <SchoolSessionAttributes
          @school={{@school}}
          @canUpdate={{@canUpdateSchoolConfig}}
          @collapse={{fn @setSchoolSessionAttributesDetails false}}
          @expand={{fn @setSchoolSessionAttributesDetails true}}
          @details={{@schoolSessionAttributesDetails}}
          @isManaging={{@schoolManageSessionAttributes}}
          @manage={{@setSchoolManageSessionAttributes}}
        />
        {{#if @schoolManageEmails}}
          <EmailsEditor
            @school={{@school}}
            @cancel={{fn @setSchoolManageEmails false}}
            @save={{this.saveEmails}}
          />
        {{else}}
          <Emails
            @canUpdate={{@canUpdateSchool}}
            @manage={{@setSchoolManageEmails}}
            @school={{@school}}
          />
        {{/if}}
        {{#if @schoolManageInstitution}}
          {{#if this.institutionLoaded}}
            <SchoolCurriculumInventoryInstitutionManager
              @canUpdate={{@canUpdateSchool}}
              @manage={{@setSchoolManageInstitution}}
              @institution={{this.institution}}
              @save={{this.saveInstitution}}
            />
          {{/if}}
        {{else}}
          <SchoolCurriculumInventoryInstitutionDetails
            @canUpdate={{@canUpdateSchool}}
            @manage={{@setSchoolManageInstitution}}
            @school={{@school}}
          />
        {{/if}}
      </div>
    </section>
  </template>
}
