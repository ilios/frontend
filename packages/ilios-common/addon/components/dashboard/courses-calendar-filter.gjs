<div
  class="calendar-filter-list large-filter-list dashboard-courses-calendar-filter"
  data-test-courses-calendar-filter
>
  <h5>
    {{t "general.courses"}}
    {{#if this.expandedYearWithoutTitleView}}
      {{#if this.academicYearCrossesCalendarYearBoundaries}}
        ({{this.expandedYearWithoutTitleView}}
        -
        {{add this.expandedYearWithoutTitleView 1}})
      {{else}}
        ({{this.expandedYearWithoutTitleView}})
      {{/if}}
    {{/if}}
  </h5>
  <div class="filters">
    {{#if this.load.isRunning}}
      <LoadingSpinner />
    {{else}}
      {{#each this.courseYears as |year|}}
        <div
          class="year {{if (includes year.year this.expandedYears) 'expanded' 'collapsed'}}"
          {{this.scrollToDefaultExpandedYear year.year}}
          {{in-viewport
            onEnter=(fn this.addYearInView year.year)
            onExit=(fn this.removeYearInView year.year)
            viewportSpy=true
          }}
          data-test-year
        >
          <h6
            class="year-title"
            data-test-year-title
            {{in-viewport
              onEnter=(fn this.addTitleInView year.year)
              onExit=(fn this.removeTitleInView year.year)
              viewportSpy=true
            }}
          >
            <button
              type="button"
              aria-expanded={{if (includes year.year this.expandedYears) "true" "false"}}
              {{on "click" (fn this.toggleYear year.year)}}
            >
              {{year.label}}
              <FaIcon
                @icon={{if (includes year.year this.expandedYears) "caret-down" "caret-right"}}
              />
            </button>
          </h6>
          {{#if (includes year.year this.expandedYears)}}
            <ul class="courses">
              {{#each (sort-by "title" year.courses) as |course|}}
                <li data-test-course>
                  <Dashboard::FilterCheckbox
                    @checked={{includes course.id @selectedCourseIds}}
                    @add={{fn @add course.id}}
                    @remove={{fn @remove course.id}}
                    @targetId={{course.id}}
                  >
                    {{course.title}}
                    {{#if course.externalId}}
                      ({{course.externalId}})
                    {{/if}}
                  </Dashboard::FilterCheckbox>
                </li>
              {{/each}}
            </ul>
          {{/if}}
        </div>
      {{/each}}
    {{/if}}
  </div>
</div>