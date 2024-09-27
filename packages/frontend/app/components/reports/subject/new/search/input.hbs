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