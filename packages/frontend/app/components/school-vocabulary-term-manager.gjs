import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { TrackedAsyncData } from 'ember-async-data';
import { task } from 'ember-concurrency';
import { uniqueId, fn } from '@ember/helper';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import FaIcon from 'ilios-common/components/fa-icon';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import SchoolVocabularyNewTerm from 'frontend/components/school-vocabulary-new-term';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import focus from 'ilios-common/modifiers/focus';

export default class SchoolVocabularyTermManagerComponent extends Component {
  @service store;
  @service flashMessages;
  @service intl;

  @tracked titleBuffer;
  @tracked descriptionBuffer;
  @tracked newTerm;

  validations = new YupValidations(this, {
    title: string()
      .ensure()
      .trim()
      .required()
      .max(200)
      .test(
        'term-title-uniqueness-per-vocabulary',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.exclusion',
          };
        },
        async (value) => {
          let terms;
          if (this.args.term.isTopLevel) {
            const vocab = await this.args.term.vocabulary;
            terms = await vocab.getTopLevelTerms();
          } else {
            const parent = await this.args.term.parent;
            terms = await parent.children;
          }
          // check if another term with the same title exists at the same level as the given term and the given title.
          return !terms.filter((term) => {
            return term.id !== this.args.term.id && term.title === value;
          }).length;
        },
      ),
  });

  get title() {
    return this.titleBuffer ?? this.args.term.title;
  }

  get description() {
    return this.descriptionBuffer ?? this.args.term.description;
  }

  @cached
  get childrenData() {
    return new TrackedAsyncData(this.args.term.children);
  }

  @cached
  get allParentsData() {
    return new TrackedAsyncData(this.args.term.getAllParents());
  }

  get children() {
    return this.childrenData.isResolved ? this.childrenData.value : null;
  }

  @cached
  get allParents() {
    return this.allParentsData.isResolved ? this.allParentsData.value : null;
  }

  get isLoading() {
    return !this.children || !this.allParents;
  }

  changeTitle = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('title');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('title');
    this.args.term.title = this.title;
    await this.args.term.save();
    this.titleBuffer = null;
  });

  @action
  revertTitleChanges() {
    this.validations.removeErrorDisplayFor('title');
    this.titleBuffer = null;
  }

  changeDescription = task({ drop: true }, async () => {
    this.args.term.set('description', this.description);
    await this.args.term.save();
    this.descriptionBuffer = null;
  });

  @action
  revertDescriptionChanges() {
    this.descriptionBuffer = null;
  }

  @action
  async createTerm(title) {
    const term = this.store.createRecord('term', {
      title,
      parent: this.args.term,
      vocabulary: this.args.vocabulary,
      active: true,
    });
    this.newTerm = await term.save();
  }

  deleteTerm = task({ drop: true }, async () => {
    const parent = await this.args.term.parent;
    const goTo = isEmpty(parent) ? null : parent.id;
    this.args.term.deleteRecord();
    if (parent) {
      const siblings = await parent.children;
      siblings.splice(siblings.indexOf(this.args.term), 1);
      parent.set('children', siblings);
    }
    await this.args.term.save();
    this.args.manageTerm(goTo);
    this.flashMessages.success(this.intl.t('general.successfullyRemovedTerm'));
  });

  @action
  clearVocabAndTerm() {
    this.args.manageVocabulary(null);
    this.args.manageTerm(null);
  }

  changeIsActive = task({ drop: true }, async (isActive) => {
    this.args.term.active = isActive;
    await this.args.term.save();
  });

  <template>
    {{#let (uniqueId) as |templateId|}}
      <div
        class="school-vocabulary-term-manager"
        data-test-school-vocabulary-term-manager
        attributes...
      >
        {{#if this.isLoading}}
          <LoadingSpinner />
        {{else}}
          <div class="breadcrumbs" data-test-breadcrumbs>
            <span>
              <button
                class="link-button"
                type="button"
                data-test-all
                {{on "click" this.clearVocabAndTerm}}
              >
                {{t "general.allVocabularies"}}
              </button>
            </span>
            <span>
              <button
                class="link-button"
                type="button"
                data-test-vocabulary
                {{on "click" (fn @manageTerm null)}}
              >
                {{@vocabulary.title}}
              </button>
            </span>
            {{#each this.allParents as |parent|}}
              <span>
                <button
                  class="link-button"
                  type="button"
                  data-test-term
                  {{on "click" (fn @manageTerm parent.id)}}
                >
                  {{parent.title}}
                </button>
              </span>
            {{/each}}
            <span data-test-term>
              {{@term.title}}
            </span>
          </div>
          {{#if @term}}
            <div class="school-vocabulary-term-manager-properties">
              <div class="block term-title" data-test-title>
                <label for="title-{{templateId}}">
                  {{t "general.title"}}:
                </label>
                {{#if @canUpdate}}
                  <EditableField
                    @value={{if this.title this.title (t "general.clickToEdit")}}
                    @save={{perform this.changeTitle}}
                    @close={{this.revertTitleChanges}}
                    as |keyboard isSaving|
                  >
                    <input
                      id="title-{{templateId}}"
                      type="text"
                      value={{this.title}}
                      disabled={{isSaving}}
                      {{on "input" (pick "target.value" (set this "titleBuffer"))}}
                      {{this.validations.attach "title"}}
                      {{keyboard}}
                      {{focus}}
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
                {{#if (and @canDelete (not this.children.length) (not @term.hasAssociations))}}
                  <FaIcon
                    @icon="trash"
                    class="clickable remove enabled"
                    {{on "click" (perform this.deleteTerm)}}
                    data-test-delete
                  />
                {{else}}
                  <FaIcon @icon="trash" class="disabled" />
                {{/if}}
              </div>
              <div class="block is-active" data-test-is-active>
                <label>
                  {{t "general.active"}}:
                </label>
                {{#if @canUpdate}}
                  <ToggleYesno
                    @yes={{@term.active}}
                    @disabled={{this.changeIsActive.isRunning}}
                    @toggle={{perform this.changeIsActive}}
                  />
                {{else if this.isActive}}
                  {{t "general.yes"}}
                {{else}}
                  {{t "general.no"}}
                {{/if}}
              </div>
              <div class="block term-description" data-test-description>
                <label for="description-{{templateId}}">
                  {{t "general.description"}}:
                </label>
                {{#if @canUpdate}}
                  <EditableField
                    @value={{if
                      this.description
                      this.description
                      (t "general.clickToAddTermDescription")
                    }}
                    @save={{perform this.changeDescription}}
                    @close={{this.revertDescriptionChanges}}
                    as |keyboard isSaving|
                  >
                    <textarea
                      id="description-{{templateId}}"
                      value={{this.description}}
                      {{on "input" (pick "target.value" (set this "descriptionBuffer"))}}
                      disabled={{isSaving}}
                      {{keyboard saveOnEnter=false}}
                      {{focus}}
                    >
                      {{this.description}}
                    </textarea>
                  </EditableField>
                {{else}}
                  {{this.description}}
                {{/if}}
              </div>
            </div>
          {{/if}}
          <h3 class="subterms-title">
            {{t "general.subTerms"}}:
          </h3>
          <div class="terms" data-test-sub-terms>
            {{#if this.newTerm}}
              <div class="saved-result">
                <button
                  class="link-button"
                  type="button"
                  {{on "click" (fn @manageTerm this.newTerm.id)}}
                >
                  <FaIcon @icon="square-up-right" />
                  {{this.newTerm.title}}
                </button>
                {{t "general.savedSuccessfully"}}
              </div>
            {{/if}}
            {{#if @canCreate}}
              <SchoolVocabularyNewTerm @createTerm={{this.createTerm}} @term={{@term}} />
            {{/if}}
            <ul data-test-term-list>
              {{#each this.children as |term|}}
                <li>
                  <button
                    class="link-button"
                    type="button"
                    data-test-term
                    {{on "click" (fn @manageTerm term.id)}}
                  >
                    {{term.title}}
                    {{#if term.hasChildren}}
                      <FaIcon
                        @icon="asterisk"
                        data-test-has-children
                        @title={{t "general.thisTermHasSubTerms"}}
                      />
                    {{/if}}
                    {{#unless term.active}}
                      <em>
                        ({{t "general.inactive"}})
                      </em>
                    {{/unless}}
                  </button>
                </li>
              {{/each}}
            </ul>
          </div>
        {{/if}}
      </div>
    {{/let}}
  </template>
}
