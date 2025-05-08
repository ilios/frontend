<div class="dashboard-calendar-filters" data-test-dashboard-calendar-filters>
  {{#if @courseFilters}}
    <Dashboard::CoursesCalendarFilter
      @school={{@school}}
      @add={{@addCourseId}}
      @remove={{@removeCourseId}}
      @selectedCourseIds={{@selectedCourseIds}}
    />
    <div
      id="calendar-sessiontypefilter"
      class="calendar-filter-list sessiontypefilter"
      data-test-session-type-filter
    >
      <h5>
        {{t "general.sessionTypes"}}
      </h5>
      <div class="filters">
        {{#if this.sessionTypesLoaded}}
          <ul>
            {{#each this.sessionTypes as |type|}}
              <li class="clickable">
                <Dashboard::FilterCheckbox
                  @checked={{includes type.id @selectedSessionTypeIds}}
                  @add={{fn @addSessionTypeId type.id}}
                  @remove={{fn @removeSessionTypeId type.id}}
                  @targetId={{type.id}}
                >
                  {{type.title}}
                </Dashboard::FilterCheckbox>
              </li>
            {{/each}}
          </ul>
        {{else}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
    <div class="calendar-filter-list vocabularyfilter" data-test-vocabulary-filter>
      <h5>
        {{t "general.terms"}}
      </h5>
      <div class="filters">
        {{#if this.vocabulariesLoaded}}
          <ul>
            {{#each this.vocabularies as |vocabulary|}}
              <Dashboard::SelectedVocabulary
                @selectedTermIds={{@selectedTermIds}}
                @vocabulary={{vocabulary}}
                @add={{@addTermId}}
                @remove={{@removeTermId}}
              />
            {{/each}}
          </ul>
        {{else}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
  {{else}}
    <div
      id="calendar-sessiontypefilter"
      class="calendar-filter-list sessiontypefilter"
      data-test-session-type-filter
    >
      <h5>
        {{t "general.sessionTypes"}}
      </h5>
      <div class="filters">
        {{#if this.sessionTypesLoaded}}
          <ul>
            {{#each this.sessionTypes as |type|}}
              <li class="clickable" data-test-filter>
                <Dashboard::FilterCheckbox
                  @checked={{includes type.id @selectedSessionTypeIds}}
                  @add={{fn @addSessionTypeId type.id}}
                  @remove={{fn @removeSessionTypeId type.id}}
                  @targetId={{type.id}}
                >
                  {{type.title}}
                </Dashboard::FilterCheckbox>
              </li>
            {{/each}}
          </ul>
        {{else}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
      </div>
    </div>
    <div
      id="calendar-courselevelfilter"
      class="calendar-filter-list courselevelfilter"
      data-test-course-level-filter
    >
      <h5>
        {{t "general.courseLevels"}}
      </h5>
      <div class="filters">
        <ul>
          {{#each this.courseLevels as |level|}}
            <li class="clickable">
              <Dashboard::FilterCheckbox
                @checked={{includes level @selectedCourseLevels}}
                @add={{fn @addCourseLevel level}}
                @remove={{fn @removeCourseLevel level}}
                @targetId={{level}}
              >
                {{level}}
              </Dashboard::FilterCheckbox>
            </li>
          {{/each}}
        </ul>
      </div>
    </div>
    <Dashboard::CohortCalendarFilter
      @cohortProxies={{@cohortProxies}}
      @add={{@addCohortId}}
      @remove={{@removeCohortId}}
      @selectedIds={{@selectedCohortIds}}
    />
  {{/if}}
</div>