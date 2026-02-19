import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { action } from '@ember/object';
import SearchBox from 'ilios-common/components/search-box';
import t from 'ember-intl/helpers/t';
import { and, gt, not } from 'ember-truth-helpers';

export default class ReportsSubjectNewSearchInputComponent extends Component {
  @tracked showMoreInputPrompt;

  @action
  search(query) {
    const q = cleanQuery(query);
    const noWhiteSpaceTerm = q.replace(/ /g, '');
    this.showMoreInputPrompt = false;
    if (noWhiteSpaceTerm.length > 0 && noWhiteSpaceTerm.length < 3) {
      this.showMoreInputPrompt = true;
      return;
    }

    this.args.search(q);
  }
  <template>
    <div data-test-report-search-input>
      <SearchBox @search={{this.search}} @clear={{this.search}} ...attributes />
      {{#if @searchIsRunning}}
        <ul class="results" data-test-results>
          <li>
            {{t "general.currentlySearchingPrompt"}}
          </li>
        </ul>
      {{/if}}
      {{#if (and @searchIsIdle this.showMoreInputPrompt)}}
        <ul class="results" data-test-results>
          <li>
            {{t "general.moreInputRequiredPrompt"}}
          </li>
        </ul>
      {{/if}}
      {{#if (and @searchIsIdle (gt @results.length 0))}}
        <ol class="results" data-test-results>
          <li class="results-count" data-test-results-count>
            {{@results.length}}
            {{t "general.results"}}
          </li>
          {{#each @results as |result|}}
            <li>{{yield result}}</li>
          {{/each}}
        </ol>
      {{else if (and @searchReturned (not @searchIsRunning))}}
        <ul class="results" data-test-results>
          <li>
            {{t "general.noSearchResultsPrompt"}}
          </li>
        </ul>
      {{/if}}
    </div>
  </template>
}
