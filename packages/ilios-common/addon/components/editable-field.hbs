<div class="editinplace{{if this.isEditing ' is-editing'}}" data-test-editable-field ...attributes>
  <span class="content">
    {{#if this.isEditing}}
      <span
        class="editor"
        {{this.focusFirstControl}}
        {{! template-lint-disable no-invalid-interactive}}
        {{on "keyup" this.keyup}}
      >
        {{yield this.saveData.isRunning (perform this.saveData) (perform this.closeEditor)}}
        <span class="actions">
          <button
            disabled={{@isSaveDisabled}}
            type="button"
            class="done"
            title={{t "general.save"}}
            {{on "click" (perform this.saveData)}}
          >
            <FaIcon
              @icon={{if this.saveData.isRunning "spinner" "check"}}
              @spin={{this.saveData.isRunning}}
            />
          </button>
          <button
            class="cancel"
            type="button"
            title={{t "general.cancel"}}
            {{on "click" (perform this.closeEditor)}}
            data-test-cancel
          >
            <FaIcon @icon="xmark" />
          </button>
        </span>
      </span>
    {{else}}
      <span>
        {{#if @value}}
          {{#if this.looksEmpty}}
            <button
              class="link-button"
              type="button"
              data-test-edit
              {{on "click" (fn this.setIsEditing true)}}
            >
              <FaIcon @icon="pen-to-square" class="enabled" />
            </button>
          {{else}}
            <FadeText
              @text={{@value}}
              @onEdit={{fn this.setIsEditing true}}
              @expanded={{@fadeTextExpanded}}
              @onExpandAll={{@onExpandAllFadeText}}
              as |displayText expand collapse updateTextDims shouldFade expanded|
            >
              <button
                class="link-button editable"
                aria-label={{t "general.edit"}}
                title={{if @showTitle (t "general.edit")}}
                data-test-edit
                type="button"
                {{on "click" (fn this.setIsEditing true)}}
              >
                <div class="display-text-wrapper{{if shouldFade ' faded'}}">
                  <div class="display-text" {{on-resize updateTextDims}}>
                    {{displayText}}
                  </div>
                </div>
                {{#if @showIcon}}
                  <FaIcon data-test-edit-icon @icon="pen-to-square" class="enabled" />
                {{/if}}
              </button>
              {{#if shouldFade}}
                <div
                  class="fade-text-control"
                  data-test-fade-text-control
                  {{! template-lint-disable no-invalid-interactive}}
                  {{on "click" (fn this.setIsEditing true)}}
                >
                  <button
                    class="expand-text-button"
                    type="button"
                    aria-label={{t "general.expand"}}
                    title={{t "general.expand"}}
                    data-test-expand
                    {{on "click" expand}}
                  >
                    <FaIcon @icon="angles-down" />
                  </button>
                </div>
              {{else}}
                {{#if expanded}}
                  <button
                    class="expand-text-button"
                    aria-label={{t "general.collapse"}}
                    title={{t "general.collapse"}}
                    type="button"
                    data-test-collapse
                    {{on "click" collapse}}
                  >
                    <FaIcon @icon="angles-up" />
                  </button>
                {{/if}}
              {{/if}}
            </FadeText>
          {{/if}}
        {{else}}
          <button
            class="link-button editable"
            aria-label={{t "general.edit"}}
            data-test-edit
            type="button"
            {{on "click" (fn this.setIsEditing true)}}
          >
            {{@clickPrompt}}
          </button>
        {{/if}}
      </span>
    {{/if}}
  </span>

</div>