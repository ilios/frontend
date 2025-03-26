<div class="single-event" data-test-single-event>
  {{#if @event}}
    <div class="single-event-summary" data-test-summary>
      <h2 data-test-header>
        {{#if this.recentlyUpdated}}
          <FaIcon
            @icon="circle-exclamation"
            @title={{t "general.newUpdates"}}
            class="recently-updated-icon-event"
            data-test-recently-updated-icon
          />
        {{/if}}
        {{#if (not @event.isPublished)}}
          <FaIcon @icon="file-signature" @title={{t "general.notPublished"}} data-test-draft-icon />
        {{else if @event.isScheduled}}
          <FaIcon @icon="clock" @title={{t "general.scheduled"}} data-test-scheduled-icon />
        {{/if}}
        <span data-test-header-title>
          {{@event.courseTitle}}
          -
          <em>
            {{#if (and this.sessionRouteExists this.canViewSession)}}
              <LinkTo
                @route="session"
                @models={{array @event.course @event.session}}
              >{{@event.name}}</LinkTo>
            {{else}}
              {{@event.name}}
            {{/if}}
          </em>
        </span>
      </h2>
      <div class="single-event-offered-at" data-test-offered-at>
        {{#if (gt @event.postrequisites.length 0)}}
          <p>
            {{t "general.dueBefore"}}
            <a href={{this.postrequisiteLink}}>{{get
                (object-at 0 @event.postrequisites)
                "name"
              }}</a>
            ({{format-date
              (get (object-at 0 @event.postrequisites) "startDate")
              month="long"
              weekday="long"
              day="numeric"
              year="numeric"
              hour12=true
              hour="2-digit"
              minute="2-digit"
            }})
          </p>
        {{/if}}
        {{#unless @event.ilmSession}}
          <p>
            {{#if (eq @event.startDate @event.endDate)}}
              {{format-date
                @event.startDate
                month="long"
                weekday="long"
                day="numeric"
                year="numeric"
                hour12=true
                hour="2-digit"
                minute="2-digit"
              }}
            {{else if this.startsAndEndsOnSameDay}}
              {{format-date
                @event.startDate
                month="long"
                weekday="long"
                day="numeric"
                year="numeric"
                hour12=true
                hour="2-digit"
                minute="2-digit"
              }}
              -
              {{format-date @event.endDate hour12=true hour="2-digit" minute="2-digit"}}
            {{else}}
              {{format-date
                @event.startDate
                month="long"
                weekday="long"
                day="numeric"
                year="numeric"
                hour12=true
                hour="2-digit"
                minute="2-digit"
              }}
              -
              {{format-date
                @event.endDate
                month="long"
                weekday="long"
                day="numeric"
                year="numeric"
                hour12=true
                hour="2-digit"
                minute="2-digit"
              }}
            {{/if}}
          </p>
        {{/unless}}
      </div>
      <div class="single-event-location">
        <OfferingUrlDisplay @url={{@event.url}} />
        {{@event.location}}
      </div>
      {{#if this.taughtBy}}
        <div class="single-event-instructors">
          {{this.taughtBy}}
        </div>
      {{/if}}
      <div class="single-event-session-is">
        <strong>{{t "general.sessionType"}}:</strong>
        {{@event.sessionTypeTitle}}
      </div>
      {{#if @event.equipmentRequired}}
        <div class="single-event-equipment-required">
          {{! template-lint-disable no-triple-curlies }}
          {{{t "general.specialEquipmentIs_Required_"}}}
          <FaIcon @icon="flask" @title={{t "general.specialEquipment"}} />
        </div>
      {{/if}}
      {{#if @event.attireRequired}}
        <div class="single-event-attire-required">
          {{! template-lint-disable no-triple-curlies }}
          {{{t "general.specialAttireIs_Required_"}}}
          <FaIcon
            @icon="black-tie"
            @prefix="brands"
            @title={{t "general.whitecoatsSlashSpecialAttire"}}
          />
        </div>
      {{/if}}
      {{#if @event.attendanceRequired}}
        <div class="single-event-attendance-required">
          {{! template-lint-disable no-triple-curlies }}
          {{{t "general.attendanceIs_Required_"}}}
          <FaIcon @icon="calendar-check" @title={{t "general.attendanceIsRequired"}} />
        </div>
      {{/if}}
      {{#if @event.supplemental}}
        <div class="single-event-supplemental">
          <strong>
            {{t "general.supplementalCurriculum"}}
          </strong>
          <FaIcon @icon="calendar-minus" @title={{t "general.supplementalCurriculum"}} />
        </div>
      {{/if}}
      {{#if @event.sessionDescription}}
        {{! template-lint-disable no-triple-curlies }}
        {{{@event.sessionDescription}}}
        <br />
      {{/if}}
    </div>
    <div class="single-event-learningmaterial-list" data-test-session-materials>
      <h3>
        <button
          class="expand-collapse-toggle-btn"
          aria-expanded={{if this.isSessionMaterialsListExpanded "true" "false"}}
          aria-label={{if
            this.isSessionMaterialsListExpanded
            (t "general.hideSessionMaterials")
            (t "general.showSessionMaterials")
          }}
          type="button"
          {{on
            "click"
            (set this "isSessionMaterialsListExpanded" (not this.isSessionMaterialsListExpanded))
          }}
          data-test-expand-collapse
        >
          {{t "general.materials"}}
          <FaIcon @icon={{if this.isSessionMaterialsListExpanded "caret-down" "caret-right"}} />
        </button>
        {{#if (and @event.isUserEvent this.userIsStudent)}}
          <button
            class="link-button"
            type="button"
            data-test-link-to-all-materials
            {{on "click" this.transitionToMyMaterials}}
          >
            <FaIcon @icon="box-archive" @title={{t "general.accessAllMaterialsForThisCourse"}} />
          </button>
        {{/if}}
      </h3>
      {{#if this.isSessionMaterialsListExpanded}}
        <SingleEventLearningmaterialList
          @learningMaterials={{this.sessionLearningMaterials}}
          @prework={{this.preworkMaterials}}
        />
      {{/if}}
    </div>
    <div class="single-event-objective-list" data-test-session-objectives>
      <SingleEventObjectiveList
        @groupByCompetenciesPhrase={{t "general.groupByCompetencies"}}
        @listByPriorityPhrase={{t "general.listByPriority"}}
        @objectives={{this.sessionObjectives}}
        @title={{t "general.objectives"}}
        @isExpandedByDefault={{true}}
      />
    </div>
    <div data-test-course-materials>
      <h3>
        <button
          class="expand-collapse-toggle-btn"
          aria-expanded={{if this.isCourseMaterialsListExpanded "true" "false"}}
          aria-label={{if
            this.isCourseMaterialsListExpanded
            (t "general.hideCourseMaterials")
            (t "general.showCourseMaterials")
          }}
          type="button"
          {{on
            "click"
            (set this "isCourseMaterialsListExpanded" (not this.isCourseMaterialsListExpanded))
          }}
          data-test-expand-collapse
        >
          {{t "general.courseMaterials"}}
          <FaIcon @icon={{if this.isCourseMaterialsListExpanded "caret-down" "caret-right"}} />
        </button>
      </h3>
      {{#if this.isCourseMaterialsListExpanded}}
        <SingleEventLearningmaterialList @learningMaterials={{this.courseLearningMaterials}} />
      {{/if}}
    </div>
    <div class="single-event-objective-list" data-test-course-objectives>
      <SingleEventObjectiveList
        @groupByCompetenciesPhrase={{t "general.groupByCompetencies"}}
        @listByPriorityPhrase={{t "general.listByPriority"}}
        @objectives={{this.courseObjectives}}
        @title={{t "general.courseObjectives"}}
        @isExpandedByDefault={{false}}
      />
    </div>
  {{else}}
    <NotFound />
  {{/if}}
</div>