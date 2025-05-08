<tr
  class={{if this.showRemoveConfirmation "confirm-removal"}}
  data-test-curriculum-inventory-sequence-block-list-item
>
  <td class="text-left" colspan="4" data-test-title>
    <LinkTo @route="curriculum-inventory-sequence-block" @model={{@sequenceBlock}}>
      {{@sequenceBlock.title}}
    </LinkTo>
  </td>
  <td class="text-center" colspan="1" data-test-starting-academic-level>
    {{@sequenceBlock.startingAcademicLevel.level}}
  </td>
  <td class="text-center" colspan="1" data-test-ending-academic-level>
    {{@sequenceBlock.endingAcademicLevel.level}}
  </td>
  <td class="text-center" colspan="2" data-test-order-in-sequence>
    {{#if @isInOrderedSequence}}
      {{@sequenceBlock.orderInSequence}}
    {{else}}
      {{t "general.notApplicableAbbr"}}
    {{/if}}
  </td>
  <td class="text-center hide-from-small-screen" colspan="2" data-test-start-date>
    {{#if @sequenceBlock.startDate}}
      {{format-date @sequenceBlock.startDate day="2-digit" month="2-digit" year="numeric"}}
    {{else}}
      {{t "general.notApplicableAbbr"}}
    {{/if}}
  </td>
  <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date>
    {{#if @sequenceBlock.endDate}}
      {{format-date @sequenceBlock.endDate day="2-digit" month="2-digit" year="numeric"}}
    {{else}}
      {{t "general.notApplicableAbbr"}}
    {{/if}}
  </td>
  <td class="text-center hide-from-small-screen" colspan="2" data-test-course>
    {{this.courseTitle}}
  </td>
  <td class="text-center" colspan="1">
    {{#if (and @canUpdate (not this.showRemoveConfirmation))}}
      <button
        class="link-button"
        type="button"
        {{on "click" (set this "showRemoveConfirmation" true)}}
        aria-label={{t "general.remove"}}
        data-test-remove
      >
        <FaIcon @icon="trash" class="enabled remove" />
      </button>
    {{else}}
      <FaIcon @icon="trash" class="disabled" />
    {{/if}}
  </td>
</tr>
{{#if this.showRemoveConfirmation}}
  <tr class="confirm-removal" data-test-confirm-removal>
    <td colspan="15">
      <div class="confirm-message">
        {{t "general.sequenceBlockConfirmRemove"}}
        <br />
        <div class="confirm-buttons">
          <button
            type="button"
            class="remove text"
            {{on "click" (fn @remove @sequenceBlock)}}
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
    </td>
  </tr>
{{/if}}