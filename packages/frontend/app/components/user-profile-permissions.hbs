<div
  class="user-profile-permissions large-component"
  data-test-user-profile-permissions
  ...attributes
>
  <h3 class="title" data-test-title>
    {{t "general.permissions"}}
    {{#unless this.isLoaded}}
      <LoadingSpinner />
    {{/unless}}
  </h3>
  {{#if this.isLoaded}}
    <span>
      <FaIcon @icon="building-columns" @fixedWidth={{true}} />
      <select
        aria-label={{t "general.schools"}}
        {{on "change" (pick "target.value" this.changeSchool)}}
        data-test-select-school
      >
        {{#each (sort-by "title" this.schools) as |school|}}
          <option value={{school.id}} selected={{eq school.id this.bestSelectedSchool.id}}>
            {{school.title}}
          </option>
        {{/each}}
      </select>
    </span>
    <span>
      <FaIcon @icon="calendar" @fixedWidth={{true}} />
      <select
        aria-label={{t "general.academicYears"}}
        {{on "change" (pick "target.value" this.changeYear)}}
        data-test-select-year
      >
        {{#each (reverse (sort-by "title" this.academicYears)) as |year|}}
          <option value={{year.id}} selected={{eq year.id this.selectedYearId}}>
            {{year.title}}
          </option>
        {{/each}}
      </select>
    </span>

    <p data-test-school-permissions>
      <h4 data-test-title>
        {{t "general.school"}}
        ({{this.bestSelectedSchool.title}})
      </h4>
      <span class="hide-on-collapse" data-test-director>
        <strong>
          {{t "general.director"}}:
        </strong>
        <YesNo @value={{this.isDirectingSchool}} />
        <br />
      </span>
      <span class="hide-on-collapse" data-test-administrator>
        <strong>
          {{t "general.administrator"}}:
        </strong>
        <YesNo @value={{this.isAdministeringSchool}} />
        <br />
      </span>
    </p>

    <p data-test-program-permissions>
      <h4 data-test-title>
        {{#if this.directedPrograms.length}}
          <button
            aria-label={{if
              this.programCollapsed
              (t "general.showRolesInPrograms")
              (t "general.hideRolesInPrograms")
            }}
            aria-expanded={{if this.programCollapsed "false" "true"}}
            class="toggle-button {{if this.programCollapsed 'collapsed' 'expanded'}}"
            type="button"
            {{on "click" (set this "programCollapsed" (not this.programCollapsed))}}
          >
            {{t "general.programs"}}
            ({{this.directedPrograms.length}})
            <FaIcon
              @icon={{if this.programCollapsed "caret-right" "caret-down"}}
              class="disabled"
            />
          </button>
        {{else}}
          {{t "general.programs"}}
          ({{this.directedPrograms.length}})
        {{/if}}
      </h4>
      {{#if (and this.directedPrograms.length this.programExpanded)}}
        <h5>
          {{t "general.director"}}
        </h5>
        <ul data-test-directors>
          {{#each (sort-by "title" this.directedPrograms) as |program|}}
            <li data-test-program>
              {{program.title}}
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </p>
    <p data-test-program-year-permissions>
      <h4 data-test-title>
        {{#if this.directedProgramYears.length}}
          <button
            aria-label={{if
              this.programYearCollapsed
              (t "general.showRolesInProgramYears")
              (t "general.hideRolesInProgramYears")
            }}
            aria-expanded={{if this.programYearCollapsed "false" "true"}}
            class="toggle-button {{if this.programYearCollapsed 'collapsed' 'expanded'}}"
            type="button"
            {{on "click" (set this "programYearCollapsed" (not this.programYearCollapsed))}}
          >
            {{t "general.programYears"}}
            ({{this.directedProgramYears.length}})
            <FaIcon
              @icon={{if this.programYearCollapsed "caret-right" "caret-down"}}
              class="disabled"
            />
          </button>
        {{else}}
          {{t "general.programYears"}}
          ({{this.directedProgramYears.length}})
        {{/if}}
      </h4>
      {{#if (and this.directedProgramYears.length this.programYearExpanded)}}
        <h5>
          {{t "general.director"}}
        </h5>
        <ul data-test-directors>
          {{#each (sort-by "program.title" "title" this.directedProgramYears) as |programYear|}}
            <li data-test-program>
              {{programYear.program.title}}
              <strong>
                {{programYear.cohort.title}}
              </strong>
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </p>
    <p data-test-course-permissions>
      <h4 data-test-title>
        {{#if this.courseCount}}
          <button
            aria-label={{if
              this.courseCollapsed
              (t "general.showRolesInCourses")
              (t "general.hideRolesInCourses")
            }}
            aria-expanded={{if this.courseCollapsed "false" "true"}}
            class="toggle-button {{if this.courseCollapsed 'collapsed' 'expanded'}}"
            type="button"
            {{on "click" (set this "courseCollapsed" (not this.courseCollapsed))}}
          >
            {{t "general.courses"}}
            ({{this.courseCount}})
            <FaIcon @icon={{if this.courseCollapsed "caret-right" "caret-down"}} class="disabled" />
          </button>
        {{else}}
          {{t "general.courses"}}
          ({{this.courseCount}})
        {{/if}}
      </h4>
      {{#if (and this.courseCount this.courseExpanded)}}
        <h5>
          {{t "general.director"}}
        </h5>
        <ul data-test-directors>
          {{#each (sort-by "title" this.directedCourses) as |course|}}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{course.year}}
                -
                {{add course.year 1}}
              {{else}}
                {{course.year}}
              {{/if}}
              <LinkTo @route="course" @model={{course}}>
                {{course.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
        <h5>
          {{t "general.administrator"}}
        </h5>
        <ul data-test-administrators>
          {{#each (sort-by "title" this.administeredCourses) as |course|}}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{course.year}}
                -
                {{add course.year 1}}
              {{else}}
                {{course.year}}
              {{/if}}
              <LinkTo @route="course" @model={{course}}>
                {{course.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
        <h5>
          {{t "general.instructor"}}
        </h5>
        <ul data-test-instructors>
          {{#each (sort-by "title" this.instructedCourses) as |course|}}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{course.year}}
                -
                {{add course.year 1}}
              {{else}}
                {{course.year}}
              {{/if}}
              <LinkTo @route="course" @model={{course}}>
                {{course.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
        <h5>
          {{t "general.studentAdvisors"}}
        </h5>
        <ul data-test-student-advisors>
          {{#each this.studentAdvisedCourses as |course|}}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{course.year}}
                -
                {{add course.year 1}}
              {{else}}
                {{course.year}}
              {{/if}}
              <LinkTo @route="course" @model={{course}}>
                {{course.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </p>
    <p data-test-session-permissions>
      <h4 data-test-title>
        {{#if this.sessionCount}}
          <button
            aria-label={{if
              this.sessionCollapsed
              (t "general.showRolesInSessions")
              (t "general.hideRolesInSessions")
            }}
            aria-expanded={{if this.sessionCollapsed "false" "true"}}
            class="toggle-button {{if this.sessionCollapsed 'collapsed' 'expanded'}}"
            type="button"
            {{on "click" (set this "sessionCollapsed" (not this.sessionCollapsed))}}
          >
            {{t "general.sessions"}}
            ({{this.sessionCount}})
            <FaIcon
              @icon={{if this.sessionCollapsed "caret-right" "caret-down"}}
              class="disabled"
            />
          </button>
        {{else}}
          {{t "general.sessions"}}
          ({{this.sessionCount}})
        {{/if}}
      </h4>
      {{#if (and this.sessionCount this.sessionExpanded)}}
        <h5>
          {{t "general.administrator"}}
        </h5>
        <ul data-test-administrators="">
          {{#each this.administeredSessions as |session|}}
            {{! template-lint-disable no-bare-strings }}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{session.course.year}}
                -
                {{add session.course.year 1}}
              {{else}}
                {{session.course.year}}
              {{/if}}
              {{session.course.title}}
              &raquo;
              <LinkTo @route="session" @models={{array session.course session}}>
                {{session.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
        <h5>
          {{t "general.instructor"}}
        </h5>
        <ul data-test-instructors>
          {{#each
            (sort-by "course.year:desc" "course.title" "title" this.instructedSessions)
            as |session|
          }}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{session.course.year}}
                -
                {{add session.course.year 1}}
              {{else}}
                {{session.course.year}}
              {{/if}}
              {{session.course.title}}
              &raquo;
              <LinkTo @route="session" @models={{array session.course session}}>
                {{session.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
        <h5>
          {{t "general.studentAdvisors"}}
        </h5>
        <ul data-test-student-advisors>
          {{#each this.studentAdvisedSessions as |session|}}
            <li data-test-course>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{session.course.year}}
                -
                {{add session.course.year 1}}
              {{else}}
                {{session.course.year}}
              {{/if}}
              {{session.course.title}}
              &raquo;
              <LinkTo @route="session" @models={{array session.course session}}>
                {{session.title}}
              </LinkTo>
            </li>
          {{else}}
            <li data-test-none>
              {{t "general.none"}}
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </p>
  {{/if}}
</div>