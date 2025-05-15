import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import and from 'ember-truth-helpers/helpers/and';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import HtmlEditor from 'ilios-common/components/html-editor';
import ObjectiveListItemCompetency from 'frontend/components/program-year/objective-list-item-competency';
import ObjectiveListItemTerms from 'ilios-common/components/objective-list-item-terms';
import ObjectiveListItemDescriptors from 'frontend/components/program-year/objective-list-item-descriptors';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import ManageObjectiveCompetency from 'frontend/components/program-year/manage-objective-competency';
import ManageObjectiveDescriptors from 'frontend/components/program-year/manage-objective-descriptors';
import ObjectiveListItemExpanded from 'frontend/components/program-year/objective-list-item-expanded';
import TaxonomyManager from 'ilios-common/components/taxonomy-manager';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import striptags from 'striptags';

export default class ProgramYearObjectiveListItemComponent extends Component {
  @service store;
  @service intl;

  @tracked description;
  @tracked isManagingCompetency;
  @tracked competencyBuffer;
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isExpanded = false;
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;
  @tracked fadeTextExpanded = false;

  constructor() {
    super(...arguments);
    this.description = this.args.programYearObjective.title;
  }

  validations = new YupValidations(this, {
    descriptionWithoutMarkup: string().trim().min(3).max(65000),
  });

  get descriptionWithoutMarkup() {
    return striptags(this.description ?? '').replace(/&nbsp;/gi, '');
  }

  @cached
  get upstreamRelationshipsData() {
    return new TrackedAsyncData(this.resolveUpstreamRelationships(this.args.programYearObjective));
  }

  get upstreamRelationships() {
    return this.upstreamRelationshipsData.isResolved ? this.upstreamRelationshipsData.value : null;
  }

  get programYear() {
    return this.upstreamRelationships?.programYear;
  }

  get program() {
    return this.upstreamRelationships?.program;
  }

  get school() {
    return this.upstreamRelationships?.school;
  }

  get vocabularies() {
    return this.upstreamRelationships?.vocabularies;
  }

  get meshDescriptors() {
    return this.upstreamRelationships?.meshDescriptors;
  }

  get assignableVocabularies() {
    return this.vocabularies ?? [];
  }

  get isManaging() {
    return (
      this.isManagingCompetency ||
      this.isManagingDescriptors ||
      this.isManagingTerms ||
      this.isExpanded
    );
  }

  get canDelete() {
    return this.args.programYearObjective.courseObjectives.length === 0;
  }

  async resolveUpstreamRelationships(programYearObjective) {
    const programYear = await programYearObjective.programYear;
    const meshDescriptors = await programYearObjective.meshDescriptors;
    const program = await programYear.program;
    const school = await program.school;
    const vocabularies = await school.vocabularies;

    return { meshDescriptors, programYear, program, school, vocabularies };
  }

  saveDescriptionChanges = dropTask(async () => {
    this.validations.addErrorDisplayFor('descriptionWithoutMarkup');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('descriptionWithoutMarkup');
    this.args.programYearObjective.set('title', this.description);
    await this.args.programYearObjective.save();
    this.highlightSave.perform();
  });

  saveIsActive = dropTask(async (active) => {
    this.args.programYearObjective.set('active', active);
    await this.args.programYearObjective.save();
    this.highlightSave.perform();
  });

  manageCompetency = dropTask(async () => {
    this.competencyBuffer = await this.args.programYearObjective.competency;
    this.isManagingCompetency = true;
  });

  manageDescriptors = dropTask(async () => {
    const meshDescriptors = await this.args.programYearObjective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors;
    this.isManagingDescriptors = true;
  });

  manageTerms = dropTask(async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    const terms = await this.args.programYearObjective.terms;
    this.termsBuffer = terms;
    this.isManagingTerms = true;
  });

  highlightSave = restartableTask(async () => {
    await timeout(1000);
  });

  saveCompetency = dropTask(async () => {
    this.args.programYearObjective.set('competency', this.competencyBuffer);
    await this.args.programYearObjective.save();
    this.competencyBuffer = null;
    this.isManagingCompetency = false;
    this.highlightSave.perform();
  });

  saveDescriptors = dropTask(async () => {
    this.args.programYearObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.programYearObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = dropTask(async () => {
    this.args.programYearObjective.set('terms', this.termsBuffer);
    await this.args.programYearObjective.save();
    this.termsBuffer = [];
    this.isManagingTerms = false;
    this.highlightSave.perform();
  });

  @action
  expandAllFadeText(isExpanded) {
    this.fadeTextExpanded = isExpanded;
  }
  @action
  revertDescriptionChanges() {
    this.description = this.args.programYearObjective.title;
    this.validations.removeErrorDisplayFor('descriptionWithoutMarkup');
  }
  @action
  changeDescription(contents) {
    this.description = contents;
    this.validations.addErrorDisplayFor('descriptionWithoutMarkup');
  }
  @action
  setCompetencyBuffer(competencyId) {
    this.competencyBuffer = findById(this.args.programYearCompetencies, competencyId);
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.descriptorsBuffer = [...this.descriptorsBuffer, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.descriptorsBuffer = this.descriptorsBuffer.filter((obj) => obj.id !== descriptor.id);
  }
  @action
  addTermToBuffer(term) {
    this.termsBuffer = [...this.termsBuffer, term];
  }
  @action
  removeTermFromBuffer(term) {
    this.termsBuffer = this.termsBuffer.filter((obj) => obj.id !== term.id);
  }
  @action
  cancel() {
    this.competencyBuffer = null;
    this.descriptorsBuffer = [];
    this.termsBuffer = [];
    this.isManagingCompetency = false;
    this.isManagingDescriptors = false;
    this.isManagingTerms = false;
    this.selectedVocabulary = null;
  }

  deleteObjective = dropTask(async () => {
    await this.args.programYearObjective.destroyRecord();
  });
  <template>
    <div
      id="objective-{{@programYearObjective.id}}"
      class="grid-row objective-row
        {{if this.showRemoveConfirmation 'confirm-removal'}}
        {{if this.highlightSave.isRunning 'highlight-ok'}}
        {{if this.isManaging 'is-managing'}}
        {{unless @programYearObjective.active 'is-inactive'}}"
      data-test-program-year-objective-list-item
    >
      <button
        class="expand-row grid-item"
        type="button"
        {{on "click" (set this "isExpanded" (not this.isExpanded))}}
        data-test-toggle-expand
      >
        {{#if this.isExpanded}}
          <FaIcon @icon="caret-down" @title={{t "general.collapseDetail"}} />
        {{else}}
          <FaIcon @icon="caret-right" @title={{t "general.expand"}} />
        {{/if}}
      </button>
      <div class="description grid-item" data-test-description>
        {{#if (and @editable (not this.isManaging) (not this.showRemoveConfirmation))}}
          <EditableField
            @value={{this.description}}
            @renderHtml={{true}}
            @save={{perform this.saveDescriptionChanges}}
            @close={{this.revertDescriptionChanges}}
            @fadeTextExpanded={{this.fadeTextExpanded}}
            @onExpandAllFadeText={{this.expandAllFadeText}}
          >
            <HtmlEditor
              @content={{this.description}}
              @update={{this.changeDescription}}
              @autofocus={{true}}
            />
            <YupValidationMessage
              @description={{t "general.description"}}
              @validationErrors={{this.validations.errors.descriptionWithoutMarkup}}
              data-test-description-validation-error-message
            />
          </EditableField>
        {{else}}
          {{! template-lint-disable no-triple-curlies }}
          {{{@programYearObjective.title}}}
        {{/if}}
      </div>
      <ObjectiveListItemCompetency
        @objective={{@programYearObjective}}
        @editable={{and @editable (not this.isManaging) (not this.showRemoveConfirmation)}}
        @manage={{perform this.manageCompetency}}
        @isManaging={{this.isManagingCompetency}}
        @save={{perform this.saveCompetency}}
        @isSaving={{this.saveCompetency.isRunning}}
        @cancel={{this.cancel}}
      />

      <ObjectiveListItemTerms
        @subject={{@programYearObjective}}
        @editable={{and @editable (not this.isManaging) (not this.showRemoveConfirmation)}}
        @manage={{perform this.manageTerms}}
        @isManaging={{this.isManagingTerms}}
        @save={{perform this.saveTerms}}
        @isSaving={{this.saveTerms.isRunning}}
        @cancel={{this.cancel}}
      />

      <ObjectiveListItemDescriptors
        @meshDescriptors={{this.meshDescriptors}}
        @editable={{and @editable (not this.isManaging) (not this.showRemoveConfirmation)}}
        @manage={{perform this.manageDescriptors}}
        @isManaging={{this.isManagingDescriptors}}
        @save={{perform this.saveDescriptors}}
        @isSaving={{this.saveDescriptors.isRunning}}
        @cancel={{this.cancel}}
      />

      <div class="actions grid-item" data-test-actions>
        {{#if (and @editable (not this.isManaging) (not this.showRemoveConfirmation))}}
          {{#if this.saveIsActive.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{#if @programYearObjective.active}}
              <button
                class="active"
                type="button"
                {{on "click" (perform this.saveIsActive false)}}
                data-test-deactivate
              >
                <FaIcon @icon="toggle-on" @title={{t "general.deactivate"}} />
              </button>
            {{else}}
              <button
                class="active"
                type="button"
                {{on "click" (perform this.saveIsActive true)}}
                data-test-activate
              >
                <FaIcon @icon="toggle-off" @title={{t "general.activate"}} />
              </button>
            {{/if}}
          {{/if}}
        {{else}}
          {{#if @programYearObjective.active}}
            <FaIcon @icon="toggle-on" @title={{t "general.active"}} />
          {{else}}
            <FaIcon @icon="toggle-off" @title={{t "general.inactive"}} />
          {{/if}}
        {{/if}}
        {{#if
          (and this.canDelete @editable (not this.isManaging) (not this.showRemoveConfirmation))
        }}
          <button
            class="link-button"
            type="button"
            {{on "click" (set this "showRemoveConfirmation" true)}}
            aria-label={{t "general.remove"}}
            data-test-remove
          >
            <FaIcon @icon="trash" class="enabled remove" />
          </button>
        {{else}}
          <FaIcon @icon="trash" class="disabled" />
        {{/if}}
      </div>

      {{#if this.showRemoveConfirmation}}
        <div class="confirm-message" data-test-confirm-removal>
          {{t "general.confirmObjectiveRemoval"}}
          <button
            class="remove"
            type="button"
            data-test-confirm
            {{on "click" (perform this.deleteObjective)}}
          >
            {{#if this.deleteObjective.isRunning}}
              <FaIcon @icon="spinner" @spin={{true}} />
            {{else}}
              {{t "general.yes"}}
            {{/if}}
          </button>
          <button
            class="done"
            type="button"
            data-test-cancel
            {{on "click" (set this "showRemoveConfirmation" false)}}
          >
            {{t "general.cancel"}}
          </button>
        </div>
      {{/if}}

      {{#if this.isManagingCompetency}}
        <ManageObjectiveCompetency
          @objective={{@programYearObjective}}
          @domainTrees={{@domainTrees}}
          @programYearCompetencies={{@programYearCompetencies}}
          @selected={{this.competencyBuffer}}
          @add={{this.setCompetencyBuffer}}
          @remove={{set this "competencyBuffer" null}}
        />
      {{/if}}
      {{#if this.isManagingDescriptors}}
        <ManageObjectiveDescriptors
          @selected={{this.descriptorsBuffer}}
          @add={{this.addDescriptorToBuffer}}
          @remove={{this.removeDescriptorFromBuffer}}
          @editable={{@editable}}
          @save={{perform this.saveDescriptors}}
          @cancel={{this.cancel}}
        />
      {{/if}}
      {{#if this.isExpanded}}
        <ObjectiveListItemExpanded @objective={{@programYearObjective}} />
      {{/if}}
      {{#if this.isManagingTerms}}
        <TaxonomyManager
          @vocabularies={{this.assignableVocabularies}}
          @vocabulary={{this.selectedVocabulary}}
          @selectedTerms={{this.termsBuffer}}
          @add={{this.addTermToBuffer}}
          @remove={{this.removeTermFromBuffer}}
          @editable={{@editable}}
          @save={{perform this.saveTerms}}
          @cancel={{this.cancel}}
        />
      {{/if}}
    </div>
  </template>
}
