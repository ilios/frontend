import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import MeshDescriptorLastTreeNumber from 'ilios-common/components/mesh-descriptor-last-tree-number';
import FaIcon from 'ilios-common/components/fa-icon';
import onClickOutside from 'ember-click-outside/modifiers/on-click-outside';
import and from 'ember-truth-helpers/helpers/and';
import lte from 'ember-truth-helpers/helpers/lte';
import includes from 'ilios-common/helpers/includes';
import mapBy0 from 'ilios-common/helpers/map-by';
import perform from 'ember-concurrency/helpers/perform';

const DEBOUNCE_TIMEOUT = 250;
const MIN_INPUT = 3;
const SEARCH_RESULTS_PER_PAGE = 50;

export default class MeshManagerComponent extends Component {
  @service store;
  @service intl;
  @tracked query = '';
  @tracked searchResults = [];
  @tracked searchPage = 0;
  @tracked hasMoreSearchResults = false;

  get terms() {
    return this.args.terms ?? [];
  }

  get hasSearchQuery() {
    return this.query.trim() !== '';
  }

  get sortedTerms() {
    if (!this.terms || this.terms.length === 0) {
      return [];
    }
    return sortBy(this.args.terms, 'name');
  }

  @action
  clear() {
    this.searchResults = [];
    this.searchPage = 0;
    this.hasMoreSearchResults = false;
    this.query = '';
  }

  @action
  add(term) {
    if (!this.args.editable) {
      return;
    }

    if (mapBy(this.terms, 'id').includes(term.id)) {
      return;
    }
    this.args.add(term);
  }

  @action
  keyUp({ key }) {
    if ('Escape' === key) {
      this.clear();
    }
  }

  @action
  update(event) {
    this.query = event.target.value;
    this.search.perform();
  }

  search = restartableTask(async () => {
    if (this.query.length < MIN_INPUT) {
      this.searchResults = [];
      return; // don't linger around return right away
    }
    await timeout(DEBOUNCE_TIMEOUT);
    const descriptors = (
      await this.store.query('mesh-descriptor', {
        q: this.query,
        limit: SEARCH_RESULTS_PER_PAGE + 1,
      })
    ).slice();

    this.searchPage = 1;
    this.hasMoreSearchResults = descriptors.length > SEARCH_RESULTS_PER_PAGE;
    if (this.hasMoreSearchResults) {
      descriptors.pop();
    }
    this.searchResults = descriptors;
  });

  searchMore = dropTask(async () => {
    const descriptors = (
      await this.store.query('mesh-descriptor', {
        q: this.query,
        limit: SEARCH_RESULTS_PER_PAGE + 1,
        offset: this.searchPage * SEARCH_RESULTS_PER_PAGE,
      })
    ).slice();
    this.searchPage = this.searchPage + 1;
    this.hasMoreSearchResults = descriptors.length > SEARCH_RESULTS_PER_PAGE;
    if (this.hasMoreSearchResults) {
      descriptors.pop();
    }
    this.searchResults = [...this.searchResults, ...descriptors];
  });
  <template>
    <section class="mesh-manager" data-test-mesh-manager>
      {{#let (uniqueId) as |templateId|}}
        {{#if @targetItemTitle}}
          <h2 class="target-title">
            {{t "general.selectMeshFor" title=@targetItemTitle}}
          </h2>
        {{/if}}
        {{#if this.sortedTerms.length}}
          <ul class="selected-terms">
            {{#each this.sortedTerms as |term|}}
              <li>
                {{#if @editable}}
                  <button type="button" {{on "click" (fn @remove term)}}>
                    <span class="term-title">
                      {{term.name}}
                    </span>
                    <span class="term-details">
                      {{term.id}}
                      {{#if term.deleted}}
                        -
                        <span class="deprecated">({{t "general.deprecatedAbbreviation"}})</span>
                      {{else if term.trees.length}}
                        -
                        <MeshDescriptorLastTreeNumber @descriptor={{term}} />
                      {{/if}}
                    </span>
                    <FaIcon @icon="xmark" class="remove" />
                  </button>
                {{else}}
                  <span class="term-title">
                    {{term.name}}
                  </span>
                  <span class="term-details">
                    {{term.id}}
                    {{#if term.deleted}}
                      -
                      <span class="deprecated">({{t "general.deprecatedAbbreviation"}})</span>
                    {{else if term.trees.length}}
                      -
                      <MeshDescriptorLastTreeNumber @descriptor={{term}} />
                    {{/if}}
                  </span>
                {{/if}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
        {{#if @editable}}
          <div class="mesh-search" data-test-mesh-search>
            <label for="mesh-search-{{templateId}}">{{t "general.searchMesh"}}:</label>
            <input
              id="mesh-search-{{templateId}}"
              autocomplete="off"
              class="search-input"
              type="search"
              value={{this.query}}
              placeholder={{t "general.search"}}
              {{on "input" this.update}}
              {{on "keyup" this.keyUp}}
            />
          </div>
        {{/if}}
        <div {{onClickOutside this.clear}} data-test-search-results-container>
          {{#if this.search.isRunning}}
            <ul class="mesh-search-results">
              <li>
                {{t "general.currentlySearchingPrompt"}}
              </li>
            </ul>
          {{else if (and this.hasSearchQuery (lte this.query.length 2))}}
            <ul class="mesh-search-results" data-test-search-results>
              <li data-test-search-result>
                {{t "general.moreInputRequiredPrompt"}}
              </li>
            </ul>
          {{else if this.searchResults.length}}
            <ul class="mesh-search-results" data-test-search-results>
              {{#each this.searchResults as |term|}}
                <li
                  class={{if (includes term.id (mapBy0 "id" this.terms)) "disabled"}}
                  data-test-search-result
                >
                  <button type="button" {{on "click" (fn this.add term)}}>
                    <span class="descriptor-name" data-test-name>
                      {{term.name}}
                    </span>
                    <span class="descriptor-id">
                      {{term.id}}
                      {{#if term.trees.length}}
                        -
                        <MeshDescriptorLastTreeNumber @descriptor={{term}} />
                      {{/if}}
                    </span>
                    <ul class="mesh-concepts">
                      {{#each term.concepts as |concept|}}
                        {{#if concept.scopeNote}}
                          <li
                            class="{{if (includes term.id (mapBy0 'id' this.terms)) 'disabled'}}
                              {{if concept.hasTruncatedScopeNote 'truncated'}}"
                          >
                            {{concept.truncatedScopeNote}}
                          </li>
                        {{/if}}
                      {{/each}}
                    </ul>
                  </button>
                </li>
              {{/each}}
            </ul>
            {{#if this.hasMoreSearchResults}}
              <button
                disabled={{if this.searchMore.isRunning true}}
                type="button"
                {{on "click" (perform this.searchMore)}}
                data-test-show-more
              >
                <FaIcon
                  @icon={{if this.searchMore.isRunning "spinner"}}
                  @spin={{if this.searchMore.isRunning true false}}
                />
                {{t "general.showMore"}}
              </button>
            {{/if}}
          {{else if (and this.hasSearchQuery this.search.lastSuccessful)}}
            <ul class="mesh-search-results" data-test-search-results>
              <li data-test-search-result>
                {{t "general.noSearchResultsPrompt"}}
              </li>
            </ul>
          {{/if}}
        </div>
      {{/let}}
    </section>
  </template>
}
