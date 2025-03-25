<button
  {{! template-lint-disable no-inline-styles }}
  style={{this.style}}
  class="weekly-calendar-event day-{{@day}}
    {{if this.isIlm 'ilm'}}
    {{if this.clickable 'clickable'}}"
  type="button"
  {{on "click" (if this.clickable @selectEvent (noop))}}
  id={{this.eventButtonId}}
  {{mouse-hover-toggle (set this "showTooltip")}}
  data-test-calendar-event
  data-test-weekly-calendar-event
>
  {{#if this.showTooltip}}
    <IliosTooltip @target={{this.eventButtonElement}} data-test-ilios-calendar-event-tooltip>
      {{this.tooltipContent}}
    </IliosTooltip>
  {{/if}}
  <span class="ilios-calendar-event-icons">
    {{#if this.recentlyUpdated}}
      <FaIcon
        @icon="circle-exclamation"
        @title={{t "general.newUpdates"}}
        class="recently-updated-icon"
        data-test-recently-updated-icon
      />
    {{/if}}
    {{#if (not @event.isPublished)}}
      <FaIcon @icon="file-signature" @title={{t "general.notPublished"}} data-test-draft-icon />
    {{else if @event.isScheduled}}
      <FaIcon @icon="clock" @title={{t "general.scheduled"}} data-test-scheduled-icon />
    {{/if}}
  </span>
  <span data-test-title>
    <span class="ilios-calendar-event-time" data-test-time>
      {{#if this.isIlm}}
        <span class="ilios-calendar-event-start">
          {{t "general.ilmDue"}}:
          {{format-date this.startDate hour12=true hour="2-digit" minute="2-digit"}}
        </span>
      {{else}}
        <span class="ilios-calendar-event-start">
          {{format-date this.startDate hour12=true hour="2-digit" minute="2-digit"}}
        </span>
      {{/if}}
    </span>
    {{#unless @event.isMulti}}
      <span class="ilios-calendar-event-location">
        {{#if @event.location.length}}
          {{@event.location}}:
        {{/if}}
      </span>
    {{/unless}}
    <span class="ilios-calendar-event-name" data-test-name>
      {{#if @event.isMulti}}
        {{@event.name}},
        <em>
          {{t "general.multiple"}}
        </em>
      {{else}}
        {{@event.name}}
      {{/if}}
    </span>
  </span>
</button>