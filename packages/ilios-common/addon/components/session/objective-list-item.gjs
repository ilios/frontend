import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import HtmlEditor from 'ilios-common/components/html-editor';
import ValidationError from 'ilios-common/components/validation-error';
import FadeText from 'ilios-common/components/fade-text';
import ObjectiveListItemParents from 'ilios-common/components/session/objective-list-item-parents';
import ObjectiveListItemTerms from 'ilios-common/components/objective-list-item-terms';
import ObjectiveListItemDescriptors from 'ilios-common/components/session/objective-list-item-descriptors';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import ManageObjectiveParents from 'ilios-common/components/session/manage-objective-parents';
import ManageObjectiveDescriptors from 'ilios-common/components/session/manage-objective-descriptors';
import TaxonomyManager from 'ilios-common/components/taxonomy-manager';

@validatable
export default class SessionObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;
  @tracked fadeTextExpanded = false;

  constructor() {
    super(...arguments);
    this.title = this.args.sessionObjective.title;
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
    return new TrackedAsyncData(this.args.sessionObjective.courseObjectives);
  }

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.sessionObjective.meshDescriptors);
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
    this.args.sessionObjective.set('title', this.title);
    await this.args.sessionObjective.save();
  });

  manageParents = dropTask(async () => {
    this.parentsBuffer = await this.args.sessionObjective.courseObjectives;
    this.isManagingParents = true;
  });

  manageDescriptors = dropTask(async () => {
    this.descriptorsBuffer = await this.args.sessionObjective.meshDescriptors;
    this.isManagingDescriptors = true;
  });

  manageTerms = dropTask(async (vocabulary) => {
    this.selectedVocabulary = vocabulary;
    this.termsBuffer = await this.args.sessionObjective.terms;
    this.isManagingTerms = true;
  });

  highlightSave = restartableTask(async () => {
    await timeout(1000);
  });

  saveParents = dropTask(async () => {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('course-objective', obj.id);
    });
    this.args.sessionObjective.set('courseObjectives', newParents);
    await this.args.sessionObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  });

  saveDescriptors = dropTask(async () => {
    this.args.sessionObjective.set('meshDescriptors', this.descriptorsBuffer);
    await this.args.sessionObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  });

  saveTerms = dropTask(async () => {
    this.args.sessionObjective.set('terms', this.termsBuffer);
    await this.args.sessionObjective.save();
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
    this.title = this.args.sessionObjective.title;
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
    await this.args.sessionObjective.destroyRecord();
  });
  <template>
    <div
      id="objective-{{@sessionObjective.id}}"
      class="grid-row objective-row{{if this.showRemoveConfirmation ' confirm-removal'}}{{if
          this.highlightSave.isRunning
          ' highlight-ok'
        }}{{if this.isManaging ' is-managing'}}"
      data-test-session-objective-list-item
    >
      <div class="description grid-item" data-test-description>
        {{#if (and @editable (not this.isManaging) (not this.showRemoveConfirmation))}}
          <EditableField
            @value={{@sessionObjective.title}}
            @renderHtml={{true}}
            @isSaveDisabled={{this.hasErrorForTitle}}
            @save={{perform this.saveTitleChanges}}
            @close={{this.revertTitleChanges}}
            @fadeTextExpanded={{this.fadeTextExpanded}}
            @onExpandAllFadeText={{this.expandAllFadeText}}
            @showTitle={{true}}
          >
            <HtmlEditor
              @content={{@sessionObjective.title}}
              @update={{this.changeTitle}}
              @autofocus={{true}}
            />
            <ValidationError @validatable={{this}} @property="title" />
          </EditableField>
        {{else}}
          <FadeText
            @text={{@sessionObjective.title}}
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
        @subject={{@sessionObjective}}
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
        <ManageObjectiveParents
          @courseObjectives={{@courseObjectives}}
          @courseTitle={{@courseTitle}}
          @selected={{this.parentsBuffer}}
          @add={{this.addParentToBuffer}}
          @remove={{this.removeParentFromBuffer}}
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
          @vocabularies={{@session.course.assignableVocabularies}}
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
