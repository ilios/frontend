import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import HtmlEditor from 'ilios-common/components/html-editor';
import FadeText from 'ilios-common/components/fade-text';
import ObjectiveListItemParents from 'ilios-common/components/course/objective-list-item-parents';
import ObjectiveListItemTerms from 'ilios-common/components/objective-list-item-terms';
import ObjectiveListItemDescriptors from 'ilios-common/components/course/objective-list-item-descriptors';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import ManageObjectiveParents from 'ilios-common/components/course/manage-objective-parents';
import ManageObjectiveDescriptors from 'ilios-common/components/course/manage-objective-descriptors';
import TaxonomyManager from 'ilios-common/components/taxonomy-manager';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import striptags from 'striptags';

export default class CourseObjectiveListItemComponent extends Component {
  @service store;
  @service intl;

  @tracked description;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;
  @tracked fadeTextExpanded = this.args.printable ?? false;

  constructor() {
    super(...arguments);
    this.description = this.args.courseObjective.title;
  }

  validations = new YupValidations(this, {
    descriptionWithoutMarkup: string().trim().min(3).max(65000),
  });

  get descriptionWithoutMarkup() {
    return striptags(this.description ?? '').replace(/&nbsp;/gi, '');
  }

  @cached
  get parentsData() {
    return new TrackedAsyncData(this.args.courseObjective.programYearObjectives);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.courseObjective.meshDescriptors);
  }

  get parents() {
    return this.parentsData.isResolved ? this.parentsData.value : null;
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value : null;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors || this.isManagingTerms;
  }

  saveDescriptionChanges = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('descriptionWithoutMarkup');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('descriptionWithoutMarkup');
    this.args.courseObjective.set('title', this.description);
    await this.args.courseObjective.save();
  });

  manageParents = task({ drop: true }, async () => {
    const objectives = this.args.cohortObjectives.reduce((set, cohortObject) => {
      const cohortObjectives = mapBy(cohortObject.competencies, 'objectives');
      return [...set, ...cohortObjectives.flat()];
    }, []);
    const parents = await this.args.courseObjective.programYearObjectives;
    this.parentsBuffer = parents.map((objective) => {
      return findById(objectives, objective.id);
    });
    this.isManagingParents = true;
  });

  manageDescriptors = task({ drop: true }, async () => {
    this.descriptorsBuffer = await this.args.courseObjective.meshDescriptors;
    this.isManagingDescriptors = true;
  });

  manageTerms = task({ drop: true }, async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    const terms = await this.args.courseObjective.terms;
    this.termsBuffer = terms;
    this.isManagingTerms = true;
  });

  highlightSave = task({ restartable: true }, async () => {
    await timeout(1000);
  });

  saveParents = task({ drop: true }, async () => {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('program-year-objective', obj.id);
    });
    this.args.courseObjective.set('programYearObjectives', newParents);
    await this.args.courseObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  });

  saveDescriptors = task({ drop: true }, async () => {
    this.args.courseObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.courseObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = task({ drop: true }, async () => {
    this.args.courseObjective.set('terms', this.termsBuffer);
    await this.args.courseObjective.save();
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
    this.description = this.args.courseObjective.title;
    this.validations.addErrorDisplayFor('descriptionWithoutMarkup');
  }
  @action
  changeDescription(contents) {
    this.description = contents;
    this.validations.addErrorDisplayFor('descriptionWithoutMarkup');
  }
  @action
  addParentToBuffer(objective) {
    this.parentsBuffer = [...this.parentsBuffer, objective];
  }
  @action
  removeParentFromBuffer(objective) {
    this.parentsBuffer = this.parentsBuffer.filter((obj) => obj.id !== objective.id);
  }
  @action
  removeParentsWithCohortFromBuffer(cohort) {
    const cohortObjectives = mapBy(cohort.competencies, 'objectives');
    const ids = mapBy([...cohortObjectives.flat()], 'id');
    this.parentsBuffer = this.parentsBuffer.filter((obj) => {
      return !ids.includes(obj.id);
    });
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
    this.parentsBuffer = [];
    this.descriptorsBuffer = [];
    this.termsBuffer = [];
    this.isManagingParents = false;
    this.isManagingDescriptors = false;
    this.isManagingTerms = false;
    this.selectedVocabulary = null;
  }

  deleteObjective = task({ drop: true }, async () => {
    await this.args.courseObjective.destroyRecord();
  });
  <template>
    <div
      id="objective-{{@courseObjective.id}}"
      class="grid-row objective-row{{if this.showRemoveConfirmation ' confirm-removal'}}{{unless
          @editable
          ' no-actions'
        }}{{if this.highlightSave.isRunning ' highlight-ok'}}{{if this.isManaging ' is-managing'}}"
      data-test-course-objective-list-item
    >
      <div class="description grid-item" data-test-description>
        {{#if (and @editable (not this.isManaging) (not this.showRemoveConfirmation))}}
          <EditableField
            @value={{this.description}}
            @renderHtml={{true}}
            @save={{perform this.saveDescriptionChanges}}
            @close={{this.revertDescriptionChanges}}
            @fadeTextExpanded={{this.fadeTextExpanded}}
            @onExpandAllFadeText={{this.expandAllFadeText}}
            @showTitle={{true}}
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
          <FadeText
            @text={{@courseObjective.title}}
            @expanded={{this.fadeTextExpanded}}
            @onExpandAll={{this.expandAllFadeText}}
          />
        {{/if}}
      </div>
      <ObjectiveListItemParents
        @parents={{this.parents}}
        @editable={{and @editable (not this.isManaging) (not this.showRemoveConfirmation)}}
        @manage={{perform this.manageParents}}
        @isManaging={{this.isManagingParents}}
        @save={{perform this.saveParents}}
        @isSaving={{this.saveParents.isRunning}}
        @cancel={{this.cancel}}
        @fadeTextExpanded={{this.fadeTextExpanded}}
        @onExpandAllFadeText={{this.expandAllFadeText}}
      />

      <ObjectiveListItemTerms
        @subject={{@courseObjective}}
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

      {{#if @editable}}
        <div class="actions grid-item" data-test-actions>
          {{#if
            (and
              @editable
              (not this.isManaging)
              (not this.showRemoveConfirmation)
              (not this.showRemoveConfirmation)
            )
          }}
            <button
              class="link-button"
              type="button"
              aria-label={{t "general.remove"}}
              {{on "click" (set this "showRemoveConfirmation" true)}}
              data-test-remove
            >
              <FaIcon @icon="trash" class="enabled remove" />
            </button>
          {{else}}
            <FaIcon @icon="trash" class="disabled" />
          {{/if}}
        </div>
      {{/if}}

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

      {{#if this.isManagingParents}}
        <ManageObjectiveParents
          @cohortObjectives={{@cohortObjectives}}
          @selected={{this.parentsBuffer}}
          @add={{this.addParentToBuffer}}
          @remove={{this.removeParentFromBuffer}}
          @removeFromCohort={{this.removeParentsWithCohortFromBuffer}}
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
      {{#if this.isManagingTerms}}
        <TaxonomyManager
          @vocabularies={{@course.assignableVocabularies}}
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
