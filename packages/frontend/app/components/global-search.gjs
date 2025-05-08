<div class="global-search" data-test-global-search ...attributes>
  <GlobalSearchBox @query={{@query}} @search={{@setQuery}} />
  <ul
    class="results {{if (and this.resultsData.isPending (not this.hasResults)) 'hidden'}}"
    data-test-results
  >
    {{#if this.resultsData.isPending}}
      <li class="searching" data-test-searching>
        <FaIcon @icon="spinner" class="orange" @spin={{true}} />
        {{t "general.currentlySearchingPrompt"}}
      </li>
    {{else}}
      {{#each this.paginatedResults as |course|}}
        <CourseSearchResult @course={{course}} />
      {{else}}
        <li class="no-results">
          {{t "general.noSearchResultsPrompt"}}
        </li>
      {{/each}}
    {{/if}}
  </ul>
  {{#if this.hasResults}}
    <fieldset class="filters">
      <legend>
        {{t "general.showResultsFor"}}
      </legend>
      <div class="year-filters">
        <select
          aria-label={{t "general.year"}}
          data-test-academic-year-filter
          {{on "change" (pick "target.value" this.setSelectedYear)}}
        >
          <option selected={{eq null @selectedYear}} value="">
            {{t "general.allAcademicYears"}}
          </option>
          {{#each this.yearOptions as |year|}}
            <option selected={{eq year @selectedYear}} value={{year}}>
              {{year}}
              -
              {{add year 1}}
            </option>
          {{/each}}
        </select>
      </div>
      {{#if (gt (get this.schools "length") 1)}}
        <div class="school-filters" data-test-school-filters>
          {{#each this.schoolOptions as |obj index|}}
            <span class="filter" data-test-school-filter>
              <input
                id="school={{index}}"
                type="checkbox"
                checked={{or (eq obj.results 0) (not (includes obj.id @ignoredSchoolIds))}}
                {{on "click" (fn this.toggleSchoolSelection obj.id)}}
                disabled={{eq obj.results 0}}
              />
              <label for="school={{index}}">
                {{obj.title}}
                ({{obj.results}})
              </label>
            </span>
          {{/each}}
        </div>
      {{/if}}
    </fieldset>
  {{/if}}
</div>
<PaginationLinks
  @page={{@page}}
  @results={{this.filteredResults}}
  @size={{this.size}}
  @onSelectPage={{@onSelectPage}}
/>