<tr
  class="list-item {{if this.showRemoveConfirmation 'confirm-removal'}}"
  data-test-active-row
  data-test-program-list-item
>
  <td class="text-left" colspan="3" data-test-title>
    <LinkTo @route="program" @model={{@program}} data-test-link>
      {{@program.title}}
    </LinkTo>
  </td>
  <td class="text-center hide-from-small-screen" colspan="2" data-test-school>
    {{@program.school.title}}
  </td>
  <td class="text-right actions" colspan="2" data-test-program>
    {{#if this.canDelete}}
      <button
        type="button"
        {{on "click" (set this "showRemoveConfirmation" true)}}
        data-test-remove
      >
        <FaIcon @icon="trash" />
      </button>
    {{else}}
      <FaIcon @icon="trash" class="disabled" />
    {{/if}}
  </td>
</tr>
{{#if this.showRemoveConfirmation}}
  <tr class="confirm-removal" data-test-confirm-removal>
    <ResponsiveTd @smallScreenSpan="5" @largeScreenSpan="7">
      <div class="confirm-message" data-test-message>
        {{t "general.confirmRemoveProgram"}}
        <br />
        <div class="confirm-buttons">
          <button
            type="button"
            class="remove text"
            {{on "click" (perform this.remove)}}
            data-test-confirm
          >
            {{t "general.yes"}}
          </button>
          <button
            type="button"
            class="done text"
            {{on "click" (set this "showRemoveConfirmation" false)}}
            data-test-cancel
          >
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    </ResponsiveTd>
  </tr>
{{/if}}