<div
  class="user-profile-ics small-component {{if this.hasSavedRecently 'has-saved' 'has-not-saved'}}"
  data-test-user-profile-ics
  ...attributes
>
  <h3 class="title" data-test-title>
    {{t "general.icsFeed"}}
  </h3>
  <div class="actions">
    {{#if @isManaging}}
      <button
        type="button"
        disabled={{this.refreshKey.isRunning}}
        title={{t "general.refreshIcsFeedKey"}}
        class="refresh-key"
        data-test-refresh-key
        {{on "click" (perform this.refreshKey)}}
      >
        <FaIcon
          @icon={{if this.refreshKey.isRunning "spinner" "rotate"}}
          @spin={{this.refreshKey.isRunning}}
        />
      </button>
      <button
        type="button"
        disabled={{this.refreshKey.isRunning}}
        class="bigcancel"
        data-test-cancel
        {{on "click" (fn @setIsManaging false)}}
      >
        <FaIcon @icon="arrow-rotate-left" />
      </button>
    {{else if @isManageable}}
      <button
        type="button"
        class="manage"
        data-test-manage
        title={{t "general.refreshIcsFeedKey"}}
        {{on "click" (fn @setIsManaging true)}}
      >
        <FaIcon @icon="pen-to-square" />
      </button>
    {{/if}}
  </div>
  <p data-test-key>
    {{#if this.icsFeedKey.length}}
      <p class="ics-instructions" data-test-instructions>
        {{t "general.icsAdminInstructions"}}
      </p>
      <p data-test-copy>
        <CopyButton @clipboardText={{this.icsFeedUrl}} @success={{perform this.textCopied}}>
          <FaIcon @icon="copy" />
          {{t "general.link"}}
        </CopyButton>
        {{#if this.showCopySuccessMessage}}
          <span class="yes" data-test-success-message>
            {{t "general.copiedSuccessfully"}}
          </span>
        {{/if}}
      </p>
    {{else}}
      {{t "general.none"}}
    {{/if}}
  </p>
</div>