<div
  class="course-visualize-session-types-graph {{unless @isIcon 'not-icon'}}"
  data-test-course-visualize-session-types-graph
  ...attributes
>
  {{#if this.isLoaded}}
    {{#if (or @isIcon this.hasChartData)}}
      {{#if this.hasChartData}}
        <SimpleChart
          @name="horz-bar"
          @isIcon={{@isIcon}}
          @data={{this.filteredChartData}}
          @onClick={{this.barClick}}
          @hover={{perform this.barHover}}
          @leave={{perform this.barHover}}
          as |chart|
        >
          {{#if this.tooltipContent}}
            <chart.tooltip @title={{this.tooltipTitle}}>
              {{this.tooltipContent}}
            </chart.tooltip>
          {{/if}}
        </SimpleChart>
      {{else}}
        {{#if @showNoChartDataError}}
          <div class="no-data" data-test-no-data>
            {{t "general.courseVisualizationsNoSessions"}}
          </div>
        {{/if}}
      {{/if}}
    {{/if}}
    {{#if (and (not @isIcon) (not this.hasData))}}
      <div class="no-data" data-test-no-data>
        {{t "general.courseVisualizationsNoSessions"}}
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
                  (eq this.sortBy "sessionTypeTitle")
                  (eq this.sortBy "sessionTypeTitle:desc")
                }}
                @onClick={{fn this.setSortBy "sessionTypeTitle"}}
                data-test-session-type
              >
                {{t "general.sessionType"}}
              </SortableTh>
              <SortableTh
                @colspan="2"
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or
                  (eq this.sortBy "sessionTitles")
                  (eq this.sortBy "sessionTitles:desc")
                }}
                @onClick={{fn this.setSortBy "sessionTitles"}}
                data-test-sessions
              >
                {{t "general.sessions"}}
              </SortableTh>
              <SortableTh
                @sortedAscending={{this.sortedAscending}}
                @sortedBy={{or (eq this.sortBy "minutes") (eq this.sortBy "minutes:desc")}}
                @onClick={{fn this.setSortBy "minutes"}}
                @sortType="numeric"
                data-test-minutes
              >
                {{t "general.minutes"}}
              </SortableTh>
            </tr>
          </thead>
          <tbody>
            {{#each (sort-by this.sortBy this.tableData) as |row|}}
              <tr>
                <td data-test-session-type>
                  <LinkTo
                    @route="course-visualize-session-type"
                    @models={{array @course.id row.sessionType.id}}
                  >
                    {{row.sessionTypeTitle}}
                  </LinkTo>
                </td>
                <td colspan="2" data-test-sessions>
                  {{#each row.sessions as |session index|}}
                    <LinkTo @route="session" @models={{array @course session}}>
                      {{session.title~}}
                    </LinkTo>{{if (not-eq index (sub row.sessions.length 1)) ","}}
                  {{/each}}
                </td>
                <td data-test-minutes>{{row.minutes}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    {{/if}}
  {{else}}
    <LoadingSpinner />
  {{/if}}
</div>