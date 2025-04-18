<tr
  class="courses-list-item
    {{if (includes @course.id @coursesForRemovalConfirmation) 'confirm-removal'}}"
  data-test-courses-list-item
>
  <td class="text-left" colspan="8" data-test-course-title>
    <LinkTo @route="course" @model={{@course}}>
      {{@course.title}}
      {{#if @course.externalId}}
        ({{@course.externalId}})
      {{/if}}
    </LinkTo>
  </td>
  <td class="text-center hide-from-small-screen" colspan="1" data-test-level>
    {{@course.level}}
  </td>
  <td class="text-center hide-from-small-screen" colspan="2" data-test-start-date>
    {{format-date @course.startDate day="2-digit" month="2-digit" year="numeric"}}
  </td>
  <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date>
    {{format-date @course.endDate day="2-digit" month="2-digit" year="numeric"}}
  </td>
  <td class="text-right" colspan="3" data-test-status>
    {{#if (includes @course.id @savingCourseIds)}}
      <LoadingSpinner />
    {{else}}
      <PublicationStatus @item={{@course}} />
      {{#if @course.locked}}
        {{#if this.canUnlock}}
          <button
            type="button"
            class="link-button"
            title={{t "general.unlockCourse"}}
            {{on "click" (fn @unlockCourse @course)}}
            data-test-unlock
          >
            <FaIcon @icon="lock" />
          </button>
        {{else}}
          <FaIcon @icon="lock" class="disabled" />
        {{/if}}
      {{else if this.canLock}}
        <button
          type="button"
          class="link-button"
          title={{t "general.lockCourse"}}
          {{on "click" (fn @lockCourse @course)}}
          data-test-lock
        >
          <FaIcon @icon="unlock" />
        </button>
      {{else}}
        <FaIcon @icon="unlock" class="disabled" />
      {{/if}}
      {{#if this.canDelete}}
        <button
          type="button"
          class="link-button"
          title={{t "general.deleteCourse"}}
          {{on "click" (fn @confirmRemoval @course)}}
          data-test-remove
        >
          <FaIcon @icon="trash" class="enabled" />
        </button>
      {{else}}
        <FaIcon @icon="trash" class="disabled" />
      {{/if}}
    {{/if}}
  </td>
</tr>