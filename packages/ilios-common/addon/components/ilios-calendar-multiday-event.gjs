<li data-test-ilios-calendar-multiday-event>
  <button
    type="button"
    class="link-button"
    disabled={{not this.enabled}}
    {{on "click" (fn this.selectEvent @event)}}
  >
    {{format-date
      @event.startDate
      month="2-digit"
      day="2-digit"
      year="2-digit"
      hour="2-digit"
      minute="2-digit"
    }}
    &ndash;
    {{format-date
      @event.endDate
      month="2-digit"
      day="2-digit"
      year="2-digit"
      hour="2-digit"
      minute="2-digit"
    }}
    <span data-test-event-name>
      {{@event.name}}
    </span>
    {{@event.location}}
  </button>
</li>