<li class="detail-learnergroups-list-item" data-test-detail-learnergroups-list-item ...attributes>
  {{#if @isManaging}}
    <button
      class="remove-learnergroup"
      type="button"
      {{on "click" (fn this.remove @group)}}
      data-test-remove-learnergroup
    >
      {{#if @group.isTopLevel}}
        {{@group.title}}
      {{else}}
        {{#each this.allParentTitles as |title|}}
          {{! template-lint-disable no-bare-strings}}
          <span class="muted">
            {{title}}
            &raquo;&nbsp;
          </span>
        {{/each}}
        {{@group.title}}
        ({{count-related @group "users"}})
      {{/if}}
      {{#if @group.needsAccommodation}}
        <FaIcon
          @icon="universal-access"
          @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
          data-test-needs-accommodation
        />
      {{/if}}
      <FaIcon @icon="xmark" class="remove" />
    </button>
  {{else}}
    {{#if @group.isTopLevel}}
      {{@group.title}}
    {{else}}
      {{#each this.allParentTitles as |title|}}
        {{! template-lint-disable no-bare-strings}}
        <span class="muted">
          {{title}}
          &raquo;&nbsp;
        </span>
      {{/each}}
      {{@group.title}}
      ({{count-related @group "users"}})
    {{/if}}
    {{#if @group.needsAccommodation}}
      <FaIcon
        @icon="universal-access"
        @title={{t "general.accommodationIsRequiredForLearnersInThisGroup"}}
        data-test-needs-accommodation
      />
    {{/if}}
  {{/if}}
</li>