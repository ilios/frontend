<tr data-test-learning-material>
  <td colspan="2">
    <UserMaterialStatus @learningMaterial={{@lm}} />
  </td>
  <td id="{{this.uniqueId}}-title" colspan="6" data-test-title>
    {{#if @lm.isBlanked}}
      <span class="lm-type-icon">
        <FaIcon @icon="clock" @title={{t "general.timedRelease"}} data-test-is-blanked />
      </span>
      {{@lm.title}}
      <span class="timed-release-info">
        <TimedReleaseSchedule @endDate={{@lm.endDate}} @startDate={{@lm.startDate}} />
      </span>
    {{else}}
      <LmTypeIcon @mimetype={{@lm.mimetype}} @type={{lm-type @lm}} />
      {{#if @lm.absoluteFileUri}}
        {{#if (eq @lm.mimetype "application/pdf")}}
          <a href="{{@lm.absoluteFileUri}}?inline" data-test-pdf-link>
            {{@lm.title}}
          </a>
          <a
            aria-labelledby="{{this.uniqueId}}-title"
            href={{@lm.absoluteFileUri}}
            rel="noopener noreferrer"
            target="_blank"
            data-test-pdf-download-link
          >
            <FaIcon
              aria-label={{t "general.download"}}
              @icon="download"
              @title={{t "general.download"}}
            />
          </a>
        {{else}}
          <a
            href={{@lm.absoluteFileUri}}
            rel="noopener noreferrer"
            target="_blank"
            data-test-file-link
          >
            {{@lm.title}}
          </a>
        {{/if}}
      {{else if @lm.link}}
        <a href={{@lm.link}} rel="noopener noreferrer" target="_blank" data-test-link>
          {{@lm.title}}
        </a>
      {{else}}
        {{@lm.title}}
        <br />
        <small>
          {{@lm.citation}}
        </small>
      {{/if}}
    {{/if}}
  </td>
  <td class="hide-from-small-screen" colspan="6" data-test-session-title>
    {{@lm.sessionTitle}}
  </td>
  <td class="hide-from-small-screen" colspan="6" data-test-course-title>
    {{@lm.courseTitle}}
  </td>
  <td class="hide-from-large-screen" colspan="6" data-test-course-session-title>
    {{#if (is-empty @lm.sessionTitle)}}
      {{@lm.courseTitle}}
    {{else}}
      {{@lm.courseTitle}}
      ::
      {{@lm.sessionTitle}}
    {{/if}}
  </td>
  <td class="hide-from-small-screen" colspan="3" data-test-instructors>
    <TruncateText @length={{25}} @text={{join ", " (sort-by this.sortString @lm.instructors)}} />
  </td>
  <td colspan="4" data-test-date>
    {{#if @lm.firstOfferingDate}}
      {{format-date @lm.firstOfferingDate day="2-digit" month="2-digit" year="numeric"}}
    {{else}}
      {{t "general.none"}}
    {{/if}}
  </td>
</tr>