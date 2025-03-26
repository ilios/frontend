<div
  class="course-visualize-instructor-term-graph {{unless @isIcon 'not-icon'}}"
  data-test-course-visualize-instructor-term-graph
  ...attributes
>
  {{#if this.isLoaded}}
    {{#if (or @isIcon this.hasChartData)}}
      <SimpleChart
        @name="horz-bar"
        @isIcon={{@isIcon}}
        @data={{this.data}}
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
        {{t "general.courseVisualizationsInstructorNoData" instructor=@user.fullName}}
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
                  (eq this.sortBy "vocabularyTerm")
                  (eq this.sortBy "vocabularyTerm:desc")
                }}
                @onClick={{fn this.setSortBy "vocabularyTerm"}}
                data-test-vocabulary-term
              >
                {{t "general.term"}}
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
                <td data-test-vocabulary-term>{{row.vocabularyTerm}}</td>
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