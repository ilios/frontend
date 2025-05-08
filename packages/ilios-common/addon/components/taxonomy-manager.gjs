import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { TrackedAsyncData } from 'ember-async-data';
import { restartableTask, timeout } from 'ember-concurrency';
import { filter } from 'rsvp';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { uniqueId } from '@ember/helper';
import DetailTermsList from 'ilios-common/components/detail-terms-list';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import eq from 'ember-truth-helpers/helpers/eq';
import perform from 'ember-concurrency/helpers/perform';
import sortBy from 'ilios-common/helpers/sort-by';
import SelectableTermsListItem from 'ilios-common/components/selectable-terms-list-item';
import SelectableTermsList from 'ilios-common/components/selectable-terms-list';

export default class TaxonomyManager extends Component {
  @service store;
  @service intl;
  @service flashMessages;
  @tracked termFilter = '';
  @tracked vocabulary = null;

  @cached
  get filteredTopLevelTermsData() {
    return new TrackedAsyncData(
      this.getFilteredTopLevelTermsFromSelectedVocabulary(this.selectedVocabulary, this.termFilter),
    );
  }

  get filteredTopLevelTerms() {
    return this.filteredTopLevelTermsData.isResolved ? this.filteredTopLevelTermsData.value : [];
  }

  async getFilteredTopLevelTermsFromSelectedVocabulary(vocabulary, termFilter) {
    if (!vocabulary) {
      return [];
    }
    const terms = await vocabulary.getTopLevelTerms();
    if (termFilter) {
      const exp = new RegExp(termFilter, 'gi');
      return await filter(terms, async (term) => {
        const searchString = await term.getTitleWithDescendantTitles();
        return searchString.match(exp);
      });
    }
    return terms;
  }

  get terms() {
    return this.filteredTopLevelTerms ?? [];
  }

  get nonEmptyVocabularies() {
    if (!this.args.vocabularies) {
      return [];
    } else {
      return this.args.vocabularies.filter((vocab) => {
        return vocab.termCount > 0;
      });
    }
  }

  @cached
  get assignableVocabulariesData() {
    return new TrackedAsyncData(this.getAssignableVocabularies(this.nonEmptyVocabularies));
  }

  get assignableVocabularies() {
    return this.assignableVocabulariesData.isResolved ? this.assignableVocabulariesData.value : [];
  }

  async getAssignableVocabularies(vocabularies) {
    // Filter out inactive vocabularies.
    const activeVocabularies = vocabularies.filter((vocab) => vocab.active);
    // Filter out vocabularies where all top-level terms are inactive.
    return filter(activeVocabularies, async (vocabulary) => {
      const topLevelTerms = await vocabulary.getTopLevelTerms();
      return !topLevelTerms.every((term) => !term.active);
    });
  }

  get listableVocabularies() {
    return this.nonEmptyVocabularies.filter((vocab) => {
      if (vocab.active) {
        return true;
      }
      const terms = this.args.selectedTerms;
      let hasTerms = false;
      terms.forEach((term) => {
        if (term.belongsTo('vocabulary').id() === vocab.id) {
          hasTerms = true;
        }
      });

      return hasTerms;
    });
  }

  get selectedVocabulary() {
    if (this.vocabulary) {
      return this.vocabulary;
    }
    if (this.args.vocabulary) {
      return this.args.vocabulary;
    }
    if (this.assignableVocabularies.length) {
      return this.assignableVocabularies[0];
    }
    return null;
  }

  get selectedVocabularyId() {
    return this.selectedVocabulary?.id;
  }

  @action
  changeSelectedVocabulary(event) {
    const vocabId = event.target.value;
    this.vocabulary = this.assignableVocabularies.find((v) => {
      return v.id === vocabId;
    });
  }

  setTermFilter = restartableTask(async (termFilter) => {
    const clean = escapeRegExp(termFilter);
    if (isPresent(clean)) {
      await timeout(250);
    }
    this.termFilter = clean;
  });
  <template>
    <section class="taxonomy-manager" data-test-taxonomy-manager ...attributes>
      {{#let (uniqueId) as |templateId|}}
        {{#if @selectedTerms}}
          <div class="selected-terms">
            {{#each this.listableVocabularies as |vocab|}}
              <DetailTermsList
                @vocabulary={{vocab}}
                @terms={{@selectedTerms}}
                @canEdit={{true}}
                @remove={{@remove}}
              />
            {{/each}}
          </div>
        {{/if}}
        {{#if this.assignableVocabularies.length}}
          <div class="vocabulary-picker">
            <div>
              <label for="vocabulary-{{templateId}}">
                {{t "general.selectVocabulary"}}:
              </label>
              <select id="vocabulary-{{templateId}}" {{on "change" this.changeSelectedVocabulary}}>
                {{#each this.assignableVocabularies as |vocab|}}
                  <option
                    value={{vocab.id}}
                    selected={{if (eq vocab.id this.selectedVocabularyId) "selected"}}
                  >
                    {{vocab.title}}
                    ({{vocab.school.title}})
                  </option>
                {{/each}}
              </select>
            </div>
            <input
              aria-label={{t "general.filterPlaceholder"}}
              autocomplete="off"
              type="search"
              value={{this.termFilter}}
              placeholder={{t "general.filterPlaceholder"}}
              {{on "input" (perform this.setTermFilter value="target.value")}}
              data-test-filter
            />
          </div>
          <div class="terms-picker tag-tree">
            <ul class="selectable-terms-list">
              {{#each (sortBy "title" this.terms) as |term|}}
                {{#if term.active}}
                  <li class="top-level">
                    <SelectableTermsListItem
                      @selectedTerms={{@selectedTerms}}
                      @term={{term}}
                      @add={{@add}}
                      @remove={{@remove}}
                    />
                    {{#if term.hasChildren}}
                      <SelectableTermsList
                        @selectedTerms={{@selectedTerms}}
                        @parent={{term}}
                        @add={{@add}}
                        @remove={{@remove}}
                        @termFilter={{this.termFilter}}
                      />
                    {{/if}}
                  </li>
                {{/if}}
              {{/each}}
            </ul>
          </div>
        {{/if}}
      {{/let}}
    </section>
  </template>
}
