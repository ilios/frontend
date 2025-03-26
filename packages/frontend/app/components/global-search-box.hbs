<div class="global-search-box" data-test-global-search-box>
  <input
    aria-label={{t "general.searchTheCurriculum"}}
    autocomplete="name"
    class="global-search-input"
    data-test-input
    type="search"
    value={{this.computedQuery}}
    {{on
      "input"
      (queue
        (pick "target.value" (set this "internalQuery"))
        (set this "autocompleteSelectedQuery" null)
        (perform this.autocomplete)
      )
    }}
    {{on-key "Escape" this.onEscapeKey}}
    {{on-key "Enter" this.onEnterKey}}
    {{on-key "ArrowUp" this.onArrowKey}}
    {{on-key "ArrowDown" this.onArrowKey}}
  />
  <button
    aria-label={{t "general.search"}}
    class="link-button search-icon"
    type="button"
    data-test-search-icon
    {{on "click" this.focusAndSearch}}
  >
    <FaIcon @icon="magnifying-glass" />
  </button>
  {{#if this.hasResults}}
    <div {{on-click-outside (set this "results" null)}}>
      <div class="autocomplete" data-test-autocomplete>
        {{#each this.results as |result|}}
          <button
            type="button"
            class="autocomplete-row"
            data-test-autocomplete-row
            {{on "click" (fn this.searchFromResult result)}}
          >
            <FaIcon @icon="magnifying-glass" />
            {{result.text}}
          </button>
        {{/each}}
      </div>
    </div>
  {{/if}}
</div>