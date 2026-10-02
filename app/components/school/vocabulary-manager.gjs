import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import { filterBy, mapBy, sortBy } from '../../utils/array-helpers';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { filter } from 'rsvp';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import EditableField from '../editable-field';
import perform from 'ember-concurrency/helpers/perform';
import pick from '../../helpers/pick';
import set from 'ember-set-helper/helpers/set';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import VocabularyNewTerm from './vocabulary-new-term';
import VocabularyTermsList from './vocabulary-terms-list';
import YupValidationMessage from '../yup-validation-message';
import YupValidations from '../../classes/yup-validations';
import { string } from 'yup';
import focus from '../../modifiers/focus';
import escapeRegExp from '../../utils/escape-reg-exp';
import { not } from 'ember-truth-helpers';
import ExpandCollapseButton from '../expand-collapse-button';
import { faSquareUpRight } from '@fortawesome/free-solid-svg-icons';

export default class SchoolVocabularyManagerComponent extends Component {
  @service store;
  @service intl;
  @service flashMessages;
  @tracked titleBuffer;
  @tracked newTerm;
  @tracked showNewTermForm = false;
  @tracked termFilter = '';

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

  get sortedTopLevelTerms() {
    if (!this.terms.length) {
      return [];
    }
    return sortBy(
      filterBy(filterBy(filterBy(this.terms, 'isTopLevel'), 'isNew', false), 'isDeleted', false),
      'title',
    );
  }

  @cached
  get filteredTopLevelTermsData() {
    return new TrackedAsyncData(
      this.getFilteredTopLevelTerms(this.sortedTopLevelTerms, this.termFilter),
    );
  }

  get filteredTopLevelTerms() {
    return this.filteredTopLevelTermsData.isResolved
      ? this.filteredTopLevelTermsData.value
      : this.sortedTopLevelTerms;
  }

  async getFilteredTopLevelTerms(terms, termFilter) {
    if (!termFilter) {
      return terms;
    }
    const exp = new RegExp(termFilter, 'gi');
    return await filter(terms, async (term) => {
      const searchString = await term.getTitleWithDescendantTitles();
      return searchString.match(exp);
    });
  }

  get title() {
    return this.titleBuffer ?? this.args.vocabulary.title;
  }

  changeTitle = task({ drop: true }, async () => {
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
  async createTerm(parent, title, description, isActive) {
    const term = this.store.createRecord('term', {
      title,
      description,
      vocabulary: this.args.vocabulary,
      active: isActive,
      ...(parent ? { parent } : {}),
    });
    this.newTerm = await term.save();
    this.showNewTermForm = false;
  }

  deleteTerm = task({ drop: true }, async (term) => {
    const parent = await term.parent;
    term.deleteRecord();
    if (parent) {
      const siblings = await parent.children;
      siblings.splice(siblings.indexOf(term), 1);
      parent.set('children', siblings);
    }
    await term.save();
    this.flashMessages.success(this.intl.t('general.successfullyRemovedTerm'));
  });

  setTermFilter = task({ restartable: true }, async (termFilter) => {
    const clean = escapeRegExp(termFilter);
    if (isPresent(clean)) {
      await timeout(250);
    }
    this.termFilter = clean;
  });

  <template>
    <div class="school-vocabulary-manager" data-test-school-vocabulary-manager ...attributes>

      <div class="back-to-vocabularies" data-test-back-to-vocabularies>
        <LinkTo
          @route="school"
          @model={{@vocabulary.school}}
          @query={{hash schoolManagedVocabulary=null schoolVocabularyDetails=true}}
        >
          {{t "general.backToVocabularies"}}
        </LinkTo>
      </div>

      <div class="school-vocabulary-header" data-test-vocabulary-header>
        <span class="title" data-test-vocabulary-title>
          {{#if @canUpdate}}
            <EditableField
              @value={{if this.title this.title (t "general.clickToEdit")}}
              @save={{perform this.changeTitle}}
              @close={{this.revertTitleChanges}}
              as |keyboard isSaving|
            >
              <input
                type="text"
                value={{this.title}}
                aria-label={{t "general.vocabularyTitle"}}
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
        </span>
      </div>

      {{#if this.newTerm}}
        <div class="saved-result">
          <button class="link-button" type="button" {{on "click" (fn @manageTerm this.newTerm.id)}}>
            <FaIcon @icon={{faSquareUpRight}} />
            {{this.newTerm.title}}
          </button>
          {{t "general.savedSuccessfully"}}
        </div>
      {{/if}}

      <div class="school-vocabulary-terms-header" data-test-vocabulary-terms-header>
        <div class="title" data-test-vocabulary-terms-title>
          {{t "general.terms"}}
          {{#if this.termsData.isResolved}}
            ({{t "general.countTotal" total=this.terms.length}})
          {{/if}}
        </div>

        <div class="actions">
          {{#if this.terms.length}}
            <input
              class="terms-filter"
              aria-label={{t "general.filterPlaceholder"}}
              autocomplete="off"
              type="search"
              value={{this.termFilter}}
              placeholder={{t "general.filterPlaceholder"}}
              {{on "input" (perform this.setTermFilter value="target.value")}}
              data-test-filter
            />
          {{/if}}
          {{#if @canCreate}}
            <ExpandCollapseButton
              @value={{this.showNewTermForm}}
              @action={{set this "showNewTermForm" (not this.showNewTermForm)}}
              @expandButtonLabel={{t "general.newTerm"}}
              @collapseButtonLabel={{t "general.close"}}
              title={{t "general.addTerm"}}
            />
          {{/if}}
        </div>
      </div>

      {{#if this.showNewTermForm}}
        <VocabularyNewTerm
          @createTerm={{fn this.createTerm null}}
          @vocabulary={{@vocabulary}}
          @cancel={{set this "showNewTermForm" false}}
        />
      {{/if}}

      {{#if this.filteredTopLevelTerms.length}}
        <div class="terms" data-test-terms>
          <VocabularyTermsList
            @terms={{this.filteredTopLevelTerms}}
            @termFilter={{this.termFilter}}
            @manageTerm={{@manageTerm}}
            @createTerm={{this.createTerm}}
            @deleteTerm={{this.deleteTerm}}
            @canCreate={{@canCreate}}
            @canUpdate={{@canUpdate}}
            @canDelete={{@canDelete}}
          />
        </div>
      {{/if}}

    </div>
  </template>
}
