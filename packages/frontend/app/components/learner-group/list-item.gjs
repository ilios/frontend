<tr
  class="{{if this.showRemoveConfirmation 'confirm-removal'}}
    {{if this.showCopyConfirmation 'confirm-copy content-row'}}"
  data-test-learner-group-list-item
>
  <td class="text-left" colspan="2" data-test-title>
    <LinkTo @route="learner-group" @model={{@learnerGroup}}>
      {{@learnerGroup.title}}
    </LinkTo>
    {{#if @learnerGroup.needsAccommodation}}
      <FaIcon
        @icon="universal-access"
        @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
        data-test-needs-accommodation
      />
    {{/if}}
  </td>
  <td class="text-center hide-from-small-screen" data-test-users>
    {{@learnerGroup.usersCount}}
  </td>
  <td class="text-center hide-from-small-screen" data-test-children>
    <span data-test-children-count>{{@learnerGroup.childrenCount}}</span>
    {{#if @learnerGroup.hasSubgroupsInNeedOfAccommodation}}
      <FaIcon
        @icon="universal-access"
        @title={{t
          "general.accommodationIsRequiredForLearnersInSubgroups"
          groups=this.sortedTitlesOfSubgroupsInNeedOfAccommodation
        }}
        data-test-subgroup-needs-accommodation
      />
    {{/if}}
  </td>
  <td class="text-right">
    {{#if (and this.canDelete (not this.showRemoveConfirmation))}}
      <button class="link-button" type="button" {{on "click" this.showRemove}} data-test-remove>
        <FaIcon @icon="trash" @title={{t "general.remove"}} />
      </button>
    {{else}}
      <FaIcon @icon="trash" class="disabled" />
    {{/if}}
    {{#if (and this.canCreate (not this.showCopyConfirmation))}}
      <button class="link-button" type="button" {{on "click" this.showCopy}} data-test-copy>
        <FaIcon @icon="copy" @title={{t "general.copy"}} />
      </button>
    {{else}}
      <FaIcon @icon="copy" class="disabled" />
    {{/if}}
  </td>
</tr>
{{#if this.showRemoveConfirmation}}
  <tr class="confirm-removal" data-test-confirm-removal>
    <td class="hide-from-small-screen"></td>
    <td colspan="3" class="confirm-message">
      {{t "general.confirmRemoveLearnerGroup" subgroupCount=@learnerGroup.children.length}}
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
    </td>
    <td class="hide-from-small-screen"></td>
  </tr>
{{/if}}
{{#if this.showCopyConfirmation}}
  <tr class="confirm-copy actions-row" data-test-confirm-copy>
    <td colspan="3">
      <div class="confirm-buttons">
        {{#if @canCopyWithLearners}}
          <button
            type="button"
            class="done text"
            {{on "click" this.copyWithLearners}}
            data-test-confirm-with-learners
          >
            {{t "general.copyWithLearners"}}
          </button>
          <button
            type="button"
            class="done text"
            {{on "click" this.copyWithoutLearners}}
            data-test-confirm-without-learners
          >
            {{t "general.copyWithoutLearners"}}
          </button>
        {{else}}
          <button
            type="button"
            class="done text"
            {{on "click" this.copyWithoutLearners}}
            data-test-confirm-without-learners
          >
            {{t "general.copy"}}
          </button>
        {{/if}}
        <button
          type="button"
          class="cancel text"
          {{on "click" (set this "showCopyConfirmation" false)}}
          data-test-cancel
        >
          {{t "general.cancel"}}
        </button>
      </div>
    </td>
    <td class="hide-from-small-screen"></td>
    <td class="hide-from-small-screen"></td>
  </tr>
{{/if}}