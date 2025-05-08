import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class CourseObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
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
    this.title = this.args.courseObjective.title;
  }

  @cached
  get hasErrorForTitleData() {
    return new TrackedAsyncData(this.hasErrorFor('title'));
  }

  get hasErrorForTitle() {
    return this.hasErrorForTitleData.isResolved ? this.hasErrorForTitleData.value : false;
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

  saveTitleChanges = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.courseObjective.set('title', this.title);
    await this.args.courseObjective.save();
  });

  manageParents = dropTask(async () => {
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

  manageDescriptors = dropTask(async () => {
    this.descriptorsBuffer = await this.args.courseObjective.meshDescriptors;
    this.isManagingDescriptors = true;
  });

  manageTerms = dropTask(async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    const terms = await this.args.courseObjective.terms;
    this.termsBuffer = terms;
    this.isManagingTerms = true;
  });

  highlightSave = restartableTask(async () => {
    await timeout(1000);
  });

  saveParents = dropTask(async () => {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('program-year-objective', obj.id);
    });
    this.args.courseObjective.set('programYearObjectives', newParents);
    await this.args.courseObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  });

  saveDescriptors = dropTask(async () => {
    this.args.courseObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.courseObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = dropTask(async () => {
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
  revertTitleChanges() {
    this.title = this.args.courseObjective.title;
    this.removeErrorDisplayFor('title');
  }
  @action
  changeTitle(contents) {
    this.title = contents;
    this.addErrorDisplayFor('title');
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

  deleteObjective = dropTask(async () => {
    await this.args.courseObjective.destroyRecord();
  });
}

<div
  id="objective-{{@courseObjective.id}}"
  class="grid-row objective-row{{if this.showRemoveConfirmation ' confirm-removal'}}{{if
      this.highlightSave.isRunning
      ' highlight-ok'
    }}{{if this.isManaging ' is-managing'}}"
  data-test-course-objective-list-item
>
  <div class="description grid-item" data-test-description>
    {{#if (and @editable (not this.isManaging) (not this.showRemoveConfirmation))}}
      <EditableField
        @value={{@courseObjective.title}}
        @renderHtml={{true}}
        @isSaveDisabled={{this.hasErrorForTitle}}
        @save={{perform this.saveTitleChanges}}
        @close={{this.revertTitleChanges}}
        @fadeTextExpanded={{this.fadeTextExpanded}}
        @onExpandAllFadeText={{this.expandAllFadeText}}
        @showTitle={{true}}
      >
        <HtmlEditor
          @content={{@courseObjective.title}}
          @update={{this.changeTitle}}
          @autofocus={{true}}
        />
        <ValidationError @validatable={{this}} @property="title" />
      </EditableField>
    {{else}}
      <FadeText
        @text={{@courseObjective.title}}
        @expanded={{this.fadeTextExpanded}}
        @onExpandAll={{this.expandAllFadeText}}
      />
    {{/if}}
  </div>
  <Course::ObjectiveListItemParents
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

  <Course::ObjectiveListItemDescriptors
    @meshDescriptors={{this.meshDescriptors}}
    @editable={{and @editable (not this.isManaging) (not this.showRemoveConfirmation)}}
    @manage={{perform this.manageDescriptors}}
    @isManaging={{this.isManagingDescriptors}}
    @save={{perform this.saveDescriptors}}
    @isSaving={{this.saveDescriptors.isRunning}}
    @cancel={{this.cancel}}
  />

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
    <Course::ManageObjectiveParents
      @cohortObjectives={{@cohortObjectives}}
      @selected={{this.parentsBuffer}}
      @add={{this.addParentToBuffer}}
      @remove={{this.removeParentFromBuffer}}
      @removeFromCohort={{this.removeParentsWithCohortFromBuffer}}
    />
  {{/if}}
  {{#if this.isManagingDescriptors}}
    <Course::ManageObjectiveDescriptors
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