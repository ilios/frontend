import Component from '@glimmer/component';
import { dropTask, enqueueTask, restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import SearchBox from 'ilios-common/components/search-box';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';
import LmTypeIcon from 'ilios-common/components/lm-type-icon';
import formatDate from 'ember-intl/helpers/format-date';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class LearningMaterialSearchComponent extends Component {
  @service store;
  @service intl;
  @tracked query = '';
  @tracked searchResults = [];
  @tracked searchPage = 0;

  @tracked searchResultsPerPage = 50;
  @tracked hasMoreSearchResults = false;
  @tracked searchReturned = false;

  search = restartableTask(async (query) => {
    if (query.trim() === '') {
      this.searchReturned = false;
      this.searchPage = 1;
      this.hasMoreSearchResults = false;
      this.searchResults = [];
      return;
    }
    this.searchReturned = false;
    this.query = query;
    const results = await this.store.query('learning-material', {
      q: query,
      limit: this.searchResultsPerPage + 1,
      'order_by[title]': 'ASC',
    });

    const lms = results.slice();
    this.searchReturned = true;
    this.searching = false;
    this.searchPage = 1;
    this.hasMoreSearchResults = lms.length > this.searchResultsPerPage;
    if (this.hasMoreSearchResults) {
      lms.pop();
    }
    this.searchResults = lms;
  });

  @action
  clear() {
    this.searchResults = [];
    this.searchReturned = false;
    this.searching = false;
    this.searchPage = 0;
    this.hasMoreSearchResults = false;
    this.query = '';
  }

  searchMore = dropTask(async () => {
    const results = await this.store.query('learning-material', {
      q: this.query,
      limit: this.searchResultsPerPage + 1,
      offset: this.searchPage * this.searchResultsPerPage,
      'order_by[title]': 'ASC',
    });

    const lms = results.slice();
    this.searchPage = this.searchPage + 1;
    this.hasMoreSearchResults = lms.length > this.searchResultsPerPage;
    if (this.hasMoreSearchResults) {
      lms.pop();
    }
    this.searchResults = [...this.searchResults, ...lms];
  });

  addLearningMaterial = enqueueTask(async (lm) => {
    if (!this.args.currentMaterialIds.includes(lm.id)) {
      await this.args.add(lm);
    }
  });
  <template>
    <div class="learningmaterial-search" data-test-learningmaterial-search>
      <SearchBox
        placeholder={{t "general.searchPlaceholder"}}
        @liveSearch={{true}}
        @search={{perform this.search}}
        @clear={{this.clear}}
      />
      {{#if this.search.isRunning}}
        <ul class="lm-search-results">
          <li>
            {{t "general.currentlySearchingPrompt"}}
          </li>
        </ul>
      {{else if this.searchResults.length}}
        <ul class="lm-search-results">
          {{#each this.searchResults as |learningMaterial|}}
            <li class={{if (includes learningMaterial.id @currentMaterialIds) "disabled"}}>
              <button
                class="result"
                type="button"
                {{on "click" (perform this.addLearningMaterial learningMaterial)}}
              >
                <div class="learning-material-title">
                  <LmTypeIcon
                    @type={{learningMaterial.type}}
                    @mimetype={{learningMaterial.mimetype}}
                  />
                  <span data-test-title>
                    {{learningMaterial.title}}
                  </span>
                </div>
                <span class="learning-material-description">
                  {{! template-lint-disable no-triple-curlies }}
                  {{{learningMaterial.description}}}
                </span>
                {{#if learningMaterial.status.title}}
                  <span class="learning-material-status">
                    {{learningMaterial.status.title}}
                  </span>
                {{/if}}
                <ul class="learning-material-properties">
                  <li>
                    {{t "general.owner"}}:
                    {{learningMaterial.owningUser.fullName}}
                  </li>
                  {{#if learningMaterial.originalAuthor}}
                    <li>
                      {{t "general.contentAuthor"}}:
                      {{learningMaterial.originalAuthor}}
                    </li>
                  {{/if}}
                  <li>
                    {{t "general.uploadDate"}}:
                    {{formatDate
                      learningMaterial.uploadDate
                      day="2-digit"
                      month="2-digit"
                      year="numeric"
                    }}
                  </li>
                </ul>
              </button>
            </li>
          {{/each}}
          {{#if this.hasMoreSearchResults}}
            <li>
              <button
                disabled={{if this.searchMore.isRunning true}}
                type="button"
                data-test-show-more
                {{on "click" (perform this.searchMore)}}
              >
                {{#if this.searchMore.isRunning}}
                  <LoadingSpinner />
                {{/if}}
                {{t "general.showMore"}}
              </button>
            </li>
          {{/if}}
        </ul>
      {{else if this.searchReturned}}
        <ul class="lm-search-results">
          <li>
            {{t "general.noSearchResultsPrompt"}}
          </li>
        </ul>
      {{/if}}
    </div>
  </template>
}
