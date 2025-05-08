<div class="dashboard-calendar" data-test-dashboard-calendar>
  <div class="dashboard-calendar-content">
    <section class="calendar-controls" data-test-dashboard-calendar-controls>
      <div class="calendar-options-control togglemyschedule" data-test-myschedule>
        <ToggleButtons
          @firstOptionSelected={{@mySchedule}}
          @firstLabel={{t "general.mySchedule"}}
          @secondLabel={{t "general.allEvents"}}
          @toggle={{@toggleMySchedule}}
        />
      </div>
      <div class="calendar-options-control showfilters" data-test-showfilters>
        <ToggleButtons
          @firstOptionSelected={{not @showFilters}}
          @firstLabel={{t "general.hideFilters"}}
          @secondLabel={{t "general.showFilters"}}
          @toggle={{@toggleShowFilters}}
        />
      </div>
      {{#if @showFilters}}
        <div class="calendar-options-control togglecoursefilters" data-test-showcoursefilters>
          <ToggleButtons
            @firstOptionSelected={{@courseFilters}}
            @firstLabel={{t "general.courseOrSessionType"}}
            @secondLabel={{t "general.programDetail"}}
            @toggle={{@toggleCourseFilters}}
          />
        </div>
      {{/if}}
      {{#if @mySchedule}}
        {{#if this.showUserContextFilters}}
          <div class="calendar-options-control toggle-user-context-filters" data-test-usercontexts>
            <Dashboard::UserContextFilter
              @setUserContext={{set this "userContext"}}
              @userContext={{this.userContext}}
            />
          </div>
        {{/if}}
      {{else}}
        <div class="calendar-options-control calendar-school-picker" data-test-school-picker>
          <FaIcon @icon="building-columns" />
          {{#if this.hasMoreThanOneSchool}}
            <select
              aria-label={{t "general.schools"}}
              {{on "change" this.changeSchool}}
              data-test-select-school
            >
              {{#each (sort-by "title" @allSchools) as |school|}}
                <option value={{school.id}} selected={{is-equal school this.bestSelectedSchool}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          {{else}}
            {{get this.bestSelectedSchool "title"}}
          {{/if}}
        </div>
      {{/if}}
      {{#if (and @showFilters this.bestSelectedSchool)}}
        <Dashboard::CalendarFilters
          @school={{this.bestSelectedSchool}}
          @courseFilters={{@courseFilters}}
          @toggleCourseFilters={{@toggleCourseFilters}}
          @selectedCohortIds={{@selectedCohortIds}}
          @addCohortId={{@addCohortId}}
          @removeCohortId={{@removeCohortId}}
          @selectedCourseLevels={{@selectedCourseLevels}}
          @addCourseLevel={{@addCourseLevel}}
          @removeCourseLevel={{@removeCourseLevel}}
          @selectedCourseIds={{@selectedCourseIds}}
          @addCourseId={{@addCourseId}}
          @removeCourseId={{@removeCourseId}}
          @selectedSessionTypeIds={{@selectedSessionTypeIds}}
          @addSessionTypeId={{@addSessionTypeId}}
          @removeSessionTypeId={{@removeSessionTypeId}}
          @selectedTermIds={{@selectedTermIds}}
          @addTermId={{@addTermId}}
          @removeTermId={{@removeTermId}}
          @cohortProxies={{this.cohortProxies}}
          class="calendar-filters"
        />
      {{/if}}
    </section>
    {{#if (and this.cohortProxiesData.isResolved (is-array this.cohortProxies))}}
      <Dashboard::FilterTags
        @selectedCourseLevels={{@selectedCourseLevels}}
        @selectedSessionTypeIds={{@selectedSessionTypeIds}}
        @selectedCohortIds={{@selectedCohortIds}}
        @selectedCourseIds={{@selectedCourseIds}}
        @selectedTermIds={{@selectedTermIds}}
        @cohortProxies={{this.cohortProxies}}
        @removeCourseLevel={{@removeCourseLevel}}
        @removeSessionTypeId={{@removeSessionTypeId}}
        @removeCohortId={{@removeCohortId}}
        @removeCourseId={{@removeCourseId}}
        @removeTermId={{@removeTermId}}
        @clearFilters={{@clearFilters}}
      />
    {{/if}}
    <section class="fullwidth ilios-calendar-container">
      <IliosCalendar
        @isLoadingEvents={{this.isLoadingEvents}}
        @calendarEvents={{this.filteredEvents}}
        @selectedDate={{@selectedDate}}
        @selectedView={{@selectedView}}
        @changeDate={{@changeDate}}
        @changeView={{@changeView}}
        @selectEvent={{@selectEvent}}
        @icsFeedUrl={{this.absoluteIcsUri}}
        @icsInstructions={{this.icsInstructionsTranslation}}
      />
    </section>
  </div>
</div>