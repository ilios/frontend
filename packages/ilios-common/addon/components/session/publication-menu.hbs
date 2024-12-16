{{#let (unique-id) as |templateId|}}
  <div
    role="menubar"
    class="publication-menu {{this.publicationStatus}}"
    id="menu-{{templateId}}"
    data-test-session-publication-menu
    {{on-click-outside (set this "isOpen" false)}}
  >
    <button
      aria-label={{this.title}}
      role="menuitem"
      class="toggle"
      aria-haspopup="true"
      aria-expanded={{if this.isOpen "true" "false"}}
      type="button"
      data-test-toggle
      {{on "keyup" this.keyUp}}
      {{on "click" this.toggleMenu}}
    >
      <FaIcon @icon={{this.icon}} />
      <span>
        {{this.title}}
      </span>
      <FaIcon @icon={{if this.isOpen "caret-down" "caret-right"}} />
    </button>
    {{#if this.isOpen}}
      <div class="menu" role="menu" data-test-menu {{focus}}>
        {{#if this.showAsIs}}
          <button
            class="danger"
            role="menuitem"
            tabindex="-1"
            type="button"
            {{on "click" this.publish}}
            {{on "keyup" this.keyUp}}
            {{on "mouseenter" this.clearFocus}}
            data-test-publish-as-is
          >
            {{t "general.publishAsIs"}}
          </button>
        {{/if}}
        {{#if this.showPublish}}
          <button
            class="good"
            role="menuitem"
            tabindex="-1"
            type="button"
            {{on "click" this.publish}}
            {{on "keyup" this.keyUp}}
            {{on "mouseenter" this.clearFocus}}
            data-test-publish
          >
            {{t "general.publishSession"}}
          </button>
        {{/if}}
        {{#if this.showReview}}
          <button
            class="good"
            role="menuitem"
            tabindex="-1"
            type="button"
            {{on "click" this.scrollToSessionPublication}}
            {{on "keyup" this.keyUp}}
            {{on "mouseenter" this.clearFocus}}
            data-test-review
          >
            {{t "general.reviewMissingItems" count=(get @session "allPublicationIssuesLength")}}
          </button>
        {{/if}}
        {{#if this.showTbd}}
          <button
            class="good"
            role="menuitem"
            tabindex="-1"
            type="button"
            {{on "click" this.publishAsTbd}}
            {{on "keyup" this.keyUp}}
            {{on "mouseenter" this.clearFocus}}
            data-test-tbd
          >
            {{t "general.markAsScheduled"}}
          </button>
        {{/if}}
        {{#if this.showUnPublish}}
          <button
            class="danger"
            role="menuitem"
            tabindex="-1"
            type="button"
            {{on "click" this.unpublish}}
            {{on "keyup" this.keyUp}}
            {{on "mouseenter" this.clearFocus}}
            data-test-un-publish
          >
            {{t "general.unPublishSession"}}
          </button>
        {{/if}}
      </div>
    {{/if}}
  </div>
{{/let}}