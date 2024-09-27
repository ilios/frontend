<div class="assign-students-manager" data-test-assign-students-manager>
  <div class="header">
    <h2 data-test-title>
      {{t "general.unassignedStudentsSummaryTitle"}}
    </h2>
  </div>
  <div class="form" data-test-cohorts>
    {{#if this.cohorts.length}}
      <label>
        {{t "general.unassignedStudentsConfirmation" count=@selectedStudents.length}}:
      </label>
      {{#if this.bestSelectedCohort}}
        <select
          aria-label={{t "general.cohorts"}}
          disabled={{@isSaving}}
          {{on "change" (pick "target.value" (set this "primaryCohortId"))}}
        >
          {{#each (sort-by "title" this.cohorts) as |cohort|}}
            <option selected={{eq cohort.id this.bestSelectedCohort.id}} value={{cohort.id}}>
              {{cohort.title}}
            </option>
          {{/each}}
        </select>
        <button
          type="button"
          class="done text"
          disabled={{or @isSaving (lt this.cohorts.length 1) (eq @selectedStudents.length 0)}}
          data-test-submit
          {{on "click" (fn @save this.bestSelectedCohort)}}
        >
          {{#if @isSaving}}
            <LoadingSpinner />
          {{else}}
            {{t "general.save"}}
          {{/if}}
        </button>
      {{/if}}
    {{else}}
      <div class="no-cohorts" data-test-no-cohorts>{{t
          "general.noCohortsAvailableForStudentAssignment"
        }}</div>
    {{/if}}
  </div>
  <div class="list">
    <table>
      <thead>
        <tr>
          <th class="text-left clickable" colspan="1">
            <label>
              <input
                checked={{and
                  @selectableStudents.length
                  (eq @selectedStudents.length @selectableStudents.length)
                }}
                type="checkbox"
                indeterminate={{and
                  (gt @selectedStudents.length 0)
                  (lt @selectedStudents.length @selectableStudents.length)
                }}
                disabled={{or @isSaving (not @selectableStudents.length) (not this.cohorts.length)}}
                {{on "click" @changeAllUserSelections}}
                data-test-toggle-all
              />
              {{t "general.all"}}
            </label>
          </th>
          <th class="text-left" colspan="4">
            {{t "general.fullName"}}
          </th>
          <th class="text-left" colspan="4">
            {{t "general.email"}}
          </th>
          <th class="text-left" colspan="2">
            {{t "general.campusId"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each @selectableStudents as |user|}}
          <tr class={{if (includes user @selectedStudents) "highlighted"}} data-test-student>
            <td class="text-left" colspan="1">
              <input
                type="checkbox"
                aria-label={{if
                  (includes user @selectedStudents)
                  (t "general.deselectUser")
                  (t "general.selectUser")
                }}
                checked={{if (includes user @selectedStudents) "checked"}}
                disabled={{or @isSaving (not this.cohorts.length)}}
                data-test-toggle
                {{on "click" (fn @changeUserSelection user.id)}}
              />
            </td>
            <td class="text-left" colspan="4" data-test-name>
              <LinkTo @route="user" @model={{user}}>
                <UserNameInfo @user={{user}} />
              </LinkTo>
            </td>
            <td class="text-left" colspan="4" data-test-email>
              {{user.email}}
            </td>
            <td class="text-left" colspan="2" data-test-campus-id>
              {{user.campusId}}
            </td>
          </tr>
        {{else}}
          <tr data-test-no-result>
            <td colspan="11" class="text-center">
              {{t "general.noResultsFound"}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</div>