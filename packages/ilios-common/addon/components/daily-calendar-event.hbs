<button
  {{! template-lint-disable no-inline-styles }}
  style={{this.style}}
  class="daily-calendar-event {{if this.isIlm 'ilm'}} {{if this.clickable 'clickable'}}"
  type="button"
  {{on "click" (if this.clickable @selectEvent (noop))}}
  id={{this.eventButtonId}}
  {{mouse-hover-toggle (set this "showTooltip")}}
  data-test-calendar-event
  data-test-daily-calendar-event
>
  {{#if this.showTooltip}}
    <IliosTooltip @target={{this.eventButtonElement}}>
      {{this.tooltipContent}}
    </IliosTooltip>
  {{/if}}
  <span class="ilios-calendar-event-icons">
    {{#if this.recentlyUpdated}}
      <FaIcon
        @icon="circle-exclamation"
        class="recently-updated-icon"
        @title={{t "general.newUpdates"}}
        data-test-recently-updated-icon
      />
    {{/if}}
    {{#if (not @event.isPublished)}}
      <FaIcon @icon="file-signature" data-test-draft-icon />
    {{else if @event.isScheduled}}
      <FaIcon @icon="clock" data-test-scheduled-icon />
    {{/if}}
  </span>
  <span class="ilios-calendar-event-time" data-test-time>
    {{#if this.isIlm}}
      <span class="ilios-calendar-event-start">
        {{t "general.ilmDue"}}:
        {{format-date @event.startDate hour12=true hour="2-digit" minute="2-digit"}}
      </span>
    {{else}}
      <span class="ilios-calendar-event-start">
        {{format-date @event.startDate hour12=true hour="2-digit" minute="2-digit"}}
      </span>
    {{/if}}
  </span>
  <span class="ilios-calendar-event-location">
    {{#if @event.location.length}}
      {{@event.location}}:
    {{/if}}
  </span>
  <span class="ilios-calendar-event-name" data-test-name>
    {{@event.name}}
  </span>
</button>