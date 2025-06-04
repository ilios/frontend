import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { filterBy, mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueId, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import SchoolVocabularyNewTerm from 'frontend/components/school-vocabulary-new-term';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class SchoolVocabularyManagerComponent extends Component {
  @service store;
  @service intl;
  @tracked titleBuffer;
  @tracked newTerm;

  validations = new YupValidations(this, {
    title: string()
      .ensure()
      .trim()
      .required()
      .max(200)
      .test(
        'vocabulary-title-uniqueness-per-school',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.exclusion',
          };
        },
        async (value) => {
          const school = await this.args.vocabulary.school;
          const allVocabsInSchool = await school.vocabularies;
          const siblings = allVocabsInSchool.filter((vocab) => {
            return vocab !== this.args.vocabulary;
          });
          const siblingTitles = mapBy(siblings, 'title');
          return !siblingTitles.includes(value);
        },
      ),
  });

  @cached
  get termsData() {
    return new TrackedAsyncData(this.args.vocabulary.terms);
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

  get sortedTerms() {
    if (!this.terms.length) {
      return [];
    }
    return sortBy(
      filterBy(filterBy(filterBy(this.terms, 'isTopLevel'), 'isNew', false), 'isDeleted', false),
      'title',
    );
  }

  get title() {
    return this.titleBuffer ?? this.args.vocabulary.title;
  }

  changeTitle = dropTask(async () => {
    this.validations.addErrorDisplayFor('title');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('title');
    this.args.vocabulary.title = this.title;
    this.titleBuffer = null;
    await this.args.vocabulary.save();
  });

  @action
  revertTitleChanges() {
    this.validations.removeErrorDisplayFor('title');
    this.titleBuffer = null;
  }

  @action
  async createTerm(title) {
    const term = this.store.createRecord('term', {
      title: title,
      vocabulary: this.args.vocabulary,
      active: true,
    });
    this.newTerm = await term.save();
  }

  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="school-vocabulary-manager" data-test-school-vocabulary-manager attributes...>
        <div class="breadcrumbs" data-test-breadcrumbs>
          <span>
            <button
              class="link-button"
              type="button"
              data-test-all
              {{on "click" (fn @manageVocabulary null)}}
            >
              {{t "general.allVocabularies"}}
            </button>
          </span>
          <span data-test-vocabulary>
            {{@vocabulary.title}}
          </span>
        </div>
        <br />
        <div class="school-vocabulary-manager-title" data-test-title>
          <label for="title-{{templateId}}">
            {{t "general.title"}}:
          </label>
          {{#if @canUpdate}}
            <EditableField
              @value={{if this.title this.title (t "general.clickToEdit")}}
              @save={{perform this.changeTitle}}
              @close={{this.revertTitleChanges}}
              @saveOnEnter={{true}}
              @closeOnEscape={{true}}
              as |isSaving|
            >
              <input
                id="title-{{templateId}}"
                type="text"
                value={{this.title}}
                disabled={{isSaving}}
                {{on "input" (pick "target.value" (set this "titleBuffer"))}}
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
          <span class="term-totals">({{t "general.countTotal" total=this.terms.length}})</span>
        </div>
        <h5>
          {{t "general.terms"}}:
        </h5>
        <div class="terms" data-test-terms>
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
            <SchoolVocabularyNewTerm @createTerm={{this.createTerm}} @vocabulary={{@vocabulary}} />
          {{/if}}
          <ul data-test-term-list>
            {{#each this.sortedTerms as |term|}}
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
      </div>
    {{/let}}
  </template>
}
