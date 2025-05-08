<div class="event" data-test-week-glance-event>
  <h3 id={{concat "event" @event.slug}} class="event-title">
    <span id={{concat "event" @event.slug "title"}} data-test-event-title>
      <LinkTo
        id={{concat "event" @event.slug "link"}}
        @route="events"
        @model={{@event.slug}}
        aria-labelledby="{{concat 'event' @event.slug 'title'}} {{concat
          'event'
          @event.slug
          'date'
        }} {{concat 'event' @event.slug 'link'}}"
      >
        {{@event.name}}
      </LinkTo>
    </span>
    <span id={{concat "event" @event.slug "date"}} class="date" data-test-date>
      {{#if @event.ilmSession}}
        <span class="ilm-due">
          {{t "general.dueBy"}}
        </span>
      {{/if}}
      {{format-date @event.startDate weekday="long" hour="2-digit" minute="2-digit"}}
    </span>
  </h3>
  <div>
    <span class="sessiontype" data-test-session-type>
      {{@event.sessionTypeTitle}}
    </span>
    {{#if @event.location}}
      <span class="location" data-test-location>
        -
        {{@event.location}}
      </span>
    {{/if}}
    <OfferingUrlDisplay @url={{@event.url}} class="url" data-test-url />
    <span class="session-attributes" data-test-session-attributes>
      {{#if @event.attireRequired}}
        <FaIcon
          @icon="black-tie"
          @prefix="brands"
          @ariaHidden={{false}}
          @title={{t "general.whitecoatsSlashSpecialAttire"}}
        />
      {{/if}}
      {{#if @event.equipmentRequired}}
        <FaIcon @icon="flask" @ariaHidden={{false}} @title={{t "general.specialEquipment"}} />
      {{/if}}
      {{#if @event.attendanceRequired}}
        <FaIcon
          @icon="calendar-check"
          @ariaHidden={{false}}
          @title={{t "general.attendanceIsRequired"}}
        />
      {{/if}}
      {{#if @event.supplemental}}
        <FaIcon
          @icon="calendar-minus"
          @ariaHidden={{false}}
          @title={{t "general.supplementalCurriculum"}}
        />
      {{/if}}
    </span>
  </div>
  {{#if @event.instructors.length}}
    <div class="instructors" data-test-instructors>
      <label>
        {{t "general.instructors"}}:
      </label>
      {{join ", " (sort-by this.sortString @event.instructors)}}
    </div>
  {{/if}}
  {{#if @event.sessionDescription.length}}
    <p class="description" data-test-description>
      <TruncateText
        @text={{@event.sessionDescription}}
        @length={{50}}
        @slippage={{200}}
        @renderHtml={{true}}
      />
    </p>
  {{/if}}
  {{#if (or this.preworkEvents this.sessionLearningMaterials)}}
    <WeekGlance::LearningMaterialList
      @event={{@event}}
      @preworkEvents={{this.preworkEvents}}
      @learningMaterials={{this.sessionLearningMaterials}}
    />
  {{/if}}
</div>