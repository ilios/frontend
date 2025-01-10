<button
  {{! template-lint-disable no-inline-styles }}
  style={{this.style}}
  class="month-event {{if this.clickable 'clickable'}}"
  type="button"
  data-test-ilios-calendar-event
  data-test-ilios-calendar-event-month
  {{on "click" (if this.clickable @selectEvent (noop))}}
  id={{this.eventButtonId}}
  {{mouse-hover-toggle (set this "showTooltip")}}
>
  {{#if @event}}
    {{#if this.showTooltip}}
      <IliosTooltip @target={{this.eventButtonElement}}>
        {{this.tooltipContent}}
      </IliosTooltip>
    {{/if}}
    {{#if this.recentlyUpdated}}
      <FaIcon @icon="exclamation" class="recently-updated-icon" @title={{t "general.newUpdates"}} />
    {{/if}}
    <span class="ilios-calendar-event-time">
      <span class="ilios-calendar-event-start">
        {{format-date @event.startDate hour12=true hour="2-digit" minute="2-digit"}}
      </span>
      <span class="ilios-calendar-event-end">
        -
        {{format-date @event.endDate hour12=true hour="2-digit" minute="2-digit"}}
      </span>
    </span>
    {{#unless @event.isMulti}}
      <span class="ilios-calendar-event-location">
        {{@event.location}}:
      </span>
    {{/unless}}
    <span class="ilios-calendar-event-name">
      {{#if @event.isMulti}}
        {{@event.name}},
        <em>
          {{t "general.multiple"}}
        </em>
      {{else}}
        {{@event.name}}
      {{/if}}
    </span>
  {{/if}}
</button>