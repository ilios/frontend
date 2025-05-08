<section
  class="monthly-calendar"
  aria-busy={{if @isLoadingEvents "true" "false"}}
  aria-live="polite"
  data-test-monthly-calendar
>
  <h2 class="month-year" data-test-month-year>
    {{#if @isLoadingEvents}}
      <FaIcon @icon="spinner" @spin={{true}} />
      {{t "general.loadingEvents"}}
      ...
    {{else}}
      {{format-date this.firstDayOfMonth month="long" year="numeric"}}
    {{/if}}
  </h2>
  <div class="calendar">
    {{#each this.days as |day|}}
      <div class="day week-{{day.weekOfMonth}} day-{{day.dayOfWeek}}" data-test-day>
        <h3 class="day-number" aria-label={{day.name}} data-test-number>
          <button
            type="button"
            aria-label={{concat (t "general.view") " " day.name}}
            {{on "click" (fn this.changeToDayView day.date)}}
            data-test-day-button={{day.dayOfMonth}}
          >
            {{day.dayOfMonth}}
          </button>
        </h3>
        {{#each (slice 0 2 day.events) as |event|}}
          {{#if event.isMulti}}
            <IliosCalendarEventMonth
              @event={{event}}
              @selectEvent={{fn @changeToDayView event.startDate}}
            />
          {{else}}
            <IliosCalendarEventMonth @event={{event}} @selectEvent={{fn @selectEvent event}} />
          {{/if}}
        {{else}}
          <span class="no-events" data-test-no-events>{{t "general.noEvents"}}</span>
        {{/each}}
        {{#if (gt day.events.length 2)}}
          <button
            type="button"
            class="month-more-events"
            aria-label={{t "general.showMore"}}
            {{on "click" (fn this.changeToDayView day.date)}}
            data-test-show-more-button
          >
            <FaIcon @icon="ellipsis" />
            <span class="text">
              {{t "general.showMore"}}
            </span>
            <FaIcon @icon="angles-down" />
          </button>
        {{/if}}
      </div>
    {{/each}}

    {{#each this.dayNames as |day|}}
      <span class="day-heading day-{{day.day}}" aria-hidden="true">
        <span class="long-name">{{day.longName}}</span>
        <span class="short-name">{{day.shortName}}</span>
      </span>
    {{/each}}
  </div>
</section>