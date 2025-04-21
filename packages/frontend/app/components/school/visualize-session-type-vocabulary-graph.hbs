<div
  class="{{unless @isIcon 'not-icon'}} school-visualize-session-type-vocabulary-graph"
  data-test-school-visualize-session-type-vocabulary-graph
  ...attributes
>
  {{#if this.isLoaded}}
    {{#if (or @isIcon this.hasChartData)}}
      <SimpleChart
        @name="donut"
        @isIcon={{@isIcon}}
        @data={{this.chartData}}
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
        {{t "general.schoolSessionTypeVocabularyVisualizationNoMapping"}}
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
                @sortedBy={{or (eq this.sortBy "termTitle") (eq this.sortBy "termTitle:desc")}}
                @onClick={{fn this.setSortBy "termTitle"}}
                data-test-term-title
              >
                {{t "general.term"}}
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
                <td data-test-term-title>{{row.termTitle}}</td>
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