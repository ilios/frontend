<div
  class="school-visualize-session-type-vocabularies-graph not-icon"
  data-test-school-visualize-session-type-vocabularies-graph
  ...attributes
>
  {{#if this.isLoaded}}
    {{#if (or @isIcon this.hasChartData)}}
      <SimpleChart
        @name="donut"
        @isIcon={{@isIcon}}
        @data={{this.chartData}}
        @onClick={{this.donutClick}}
        @hover={{perform this.donutHover}}
        @leave={{perform this.donutHover}}
        as |chart|
      >
        {{#if this.tooltipContent}}
          <chart.tooltip @title={{this.tooltipTitle}}>
            {{this.tooltipContent}}
          </chart.tooltip>
        {{/if}}
      </SimpleChart>
    {{/if}}
    {{#if (and (not @isIcon) (not this.hasData))}}
      <div class="no-data" data-test-no-data>
        {{t "general.schoolSessionTypeVocabulariesVisualizationNoMapping"}}
      </div>
    {{/if}}
    {{#if (and (not @isIcon) this.hasData @showDataTable)}}
      <div class="data-table" data-test-data-table>
        <div class="table-actions" data-test-data-table-actions>
          <button type="button" {{on "click" (perform this.downloadData)}} data-test-download-data>
            <FaIcon @icon="download" />
            {{t "general.download"}}
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <SortableTh
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or
                  (eq this.sortBy "vocabularyTitle")
                  (eq this.sortBy "vocabularyTitle:desc")
                }}
                @onClick={{fn this.setSortBy "vocabularyTitle"}}
                data-test-vocabulary-title
              >
                {{t "general.vocabulary"}}
              </SortableTh>
              <SortableTh
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq this.sortBy "termsCount") (eq this.sortBy "termsCount:desc")}}
                @onClick={{fn this.setSortBy "termsCount"}}
                @sortType="numeric"
                data-test-terms-count
              >
                {{t "general.terms"}}
              </SortableTh>
              <SortableTh
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or
                  (eq this.sortBy "sessionsCount")
                  (eq this.sortBy "sessionsCount:desc")
                }}
                @onClick={{fn this.setSortBy "sessionsCount"}}
                @sortType="numeric"
                data-test-sessions-count
              >
                {{t "general.sessions"}}
              </SortableTh>
            </tr>
          </thead>
          <tbody>
            {{#each (sort-by this.sortBy this.tableData) as |row|}}
              <tr>
                <td data-test-vocabulary-title>
                  <LinkTo
                    @route="session-type-visualize-vocabulary"
                    @models={{array @sessionType.id row.vocabularyId}}
                  >
                    {{row.vocabularyTitle}}
                  </LinkTo>
                </td>
                <td data-test-terms-count>{{row.termsCount}}</td>
                <td data-test-sessions-count>{{row.sessionsCount}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    {{/if}}
  {{else}}
    <FaIcon @icon="spinner" @spin={{true}} />
  {{/if}}
</div>