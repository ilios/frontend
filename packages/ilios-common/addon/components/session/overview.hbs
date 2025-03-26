<div data-test-session-overview>
  {{#let (unique-id) as |templateId|}}
    {{#if this.isLoaded}}
      <Session::Header
        @session={{@session}}
        @editable={{@editable}}
        @hideCheckLink={{@hideCheckLink}}
      />

      <section class="session-overview">
        <div class="last-update" data-test-last-update>
          <FaIcon @icon="clock-rotate-left" @title={{t "general.lastUpdate"}} />
          {{t "general.lastUpdate"}}:
          {{format-date
            @session.updatedAt
            month="2-digit"
            day="2-digit"
            year="numeric"
            hour="2-digit"
            minute="2-digit"
          }}
        </div>

        <div class="session-overview-header">

          <div class="title">
            {{t "general.overview"}}
          </div>

          <div class="session-overview-actions">
            {{#if this.showCopy}}
              <LinkTo
                @route="session.copy"
                @models={{array @session.course @session}}
                class="copy"
                data-test-copy
              >
                <FaIcon @icon="copy" @title={{t "general.copySession"}} @fixedWidth={{true}} />
              </LinkTo>
            {{/if}}
          </div>
        </div>

        <div class="session-overview-content">
          <div class="sessiontype block" data-test-session-type>
            <label for="session-type-{{templateId}}">{{t "general.sessionType"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{this.sessionType.title}}
                  @save={{this.changeSessionType}}
                  @close={{this.revertSessionTypeChanges}}
                >
                  <select id="session-type-{{templateId}}" {{on "change" this.setSessionType}}>
                    {{#each this.sortedSessionTypes as |sessionType|}}
                      <option
                        value={{sessionType.id}}
                        selected={{eq sessionType.id this.sessionType.id}}
                      >
                        {{sessionType.title}}
                      </option>
                    {{/each}}
                  </select>
                </EditableField>
                {{#unless this.sessionType.active}}
                  <em>({{t "general.inactive"}})</em>
                {{/unless}}
              {{else}}
                {{@session.sessionType.title}}
                {{#unless this.sessionType.active}}
                  <em>({{t "general.inactive"}})</em>
                {{/unless}}
              {{/if}}
            </span>
          </div>
          {{#if this.showSupplemental}}
            <div class="sessionsupplemental block" data-test-supplemental>
              <label>{{t "general.supplementalCurriculum"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno @yes={{@session.supplemental}} @toggle={{this.changeSupplemental}} />
                {{else}}
                  {{#if @session.supplemental}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          {{#if this.showSpecialAttireRequired}}
            <div class="sessionspecialattire block" data-test-special-attire>
              <label>{{t "general.specialAttireRequired"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno
                    @yes={{@session.attireRequired}}
                    @toggle={{this.changeSpecialAttire}}
                  />
                {{else}}
                  {{#if @session.attireRequired}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          {{#if this.showSpecialEquipmentRequired}}
            <div class="sessionspecialequipment block" data-test-special-equipment>
              <label>{{t "general.specialEquipmentRequired"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno
                    @yes={{@session.equipmentRequired}}
                    @toggle={{this.changeSpecialEquipment}}
                  />
                {{else}}
                  {{#if @session.equipmentRequired}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          {{#if this.showAttendanceRequired}}
            <div class="sessionattendancerequired block" data-test-attendance-required>
              <label>{{t "general.attendanceRequired"}}:</label>
              <span>
                {{#if @editable}}
                  <ToggleYesno
                    @yes={{@session.attendanceRequired}}
                    @toggle={{this.changeAttendanceRequired}}
                  />
                {{else}}
                  {{#if @session.attendanceRequired}}
                    <span class="add">{{t "general.yes"}}</span>
                  {{else}}
                    <span class="remove">{{t "general.no"}}</span>
                  {{/if}}
                {{/if}}
              </span>
            </div>
          {{/if}}
          <hr />
          <Session::Ilm @session={{@session}} @editable={{@editable}} />
          <div class="postrequisite block" data-test-postrequisite>
            {{#if @editable}}
              {{#if this.isEditingPostRequisite}}
                <Session::PostrequisiteEditor
                  @session={{@session}}
                  @close={{toggle "isEditingPostRequisite" this}}
                />
              {{else}}
                <label>
                  {{#if @session.hasPostrequisite}}
                    <LinkTo
                      @route="session.index"
                      @models={{array this.postrequisiteCourse this.postrequisite}}
                    >
                      <FaIcon @icon="square-up-right" />
                      {{t "general.duePriorTo"}}:
                    </LinkTo>
                  {{else}}
                    {{t "general.duePriorTo"}}:
                  {{/if}}
                </label>
                <button
                  class="post-requisite-edit"
                  type="button"
                  {{on "click" (toggle "isEditingPostRequisite" this)}}
                  data-test-edit
                >
                  {{#if @session.hasPostrequisite}}
                    {{@session.postrequisite.title}}
                  {{else}}
                    {{t "general.none"}}
                  {{/if}}
                </button>
              {{/if}}
            {{else}}
              <label>
                {{#if @session.hasPostrequisite}}
                  <LinkTo
                    @route="session.index"
                    @models={{array this.postrequisiteCourse this.postrequisite}}
                  >
                    <FaIcon @icon="square-up-right" />
                    {{t "general.duePriorTo"}}:
                  </LinkTo>>
                {{else}}
                  {{t "general.duePriorTo"}}:
                {{/if}}
              </label>
              {{#if @session.hasPostrequisite}}
                {{@session.postrequisite.title}}
              {{else}}
                {{t "general.none"}}
              {{/if}}
            {{/if}}
          </div>
          <div class="prerequisites block" data-test-prerequisites>
            <label>{{t "general.prerequisites"}}:</label>
            {{#if @session.hasPrerequisites}}
              <span>
                {{#each this.prerequisites as |prerequisite index|~}}<LinkTo
                    @route="session.index"
                    @models={{array prerequisite.course prerequisite}}
                  ><FaIcon @icon="square-up-right" /> {{prerequisite.title}}</LinkTo>{{#if
                    (not-eq index (sub this.prerequisites.length 1))
                  }}, {{/if}}{{~/each}}
              </span>
            {{else}}
              {{t "general.none"}}
            {{/if}}
          </div>
          <hr />
          <div class="sessiondescription" data-test-description>
            <label>{{t "general.description"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{this.description}}
                  @renderHtml={{true}}
                  @isSaveDisabled={{this.validations.errors.description}}
                  @save={{perform this.saveDescription}}
                  @close={{this.revertDescriptionChanges}}
                  @clickPrompt={{t "general.clickToEdit"}}
                >
                  <HtmlEditor @content={{this.description}} @update={{this.changeDescription}} />
                  <YupValidationMessage
                    @description={{t "general.description"}}
                    @validationErrors={{this.validations.errors.description}}
                  />
                </EditableField>
              {{else}}
                {{! template-lint-disable no-triple-curlies}}
                {{{this.description}}}
              {{/if}}
            </span>
          </div>
          <div class="instructional-notes" data-test-instructional-notes>
            <label>{{t "general.instructionalNotes"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{@session.instructionalNotes}}
                  @renderHtml={{true}}
                  @isSaveDisabled={{this.validations.errors.instructionalNotes}}
                  @save={{perform this.saveInstructionalNotes}}
                  @close={{this.revertInstructionalNotesChanges}}
                  @clickPrompt={{t "general.clickToEdit"}}
                >
                  <HtmlEditor
                    @content={{this.instructionalNotes}}
                    @update={{this.changeInstructionalNotes}}
                  />
                  <YupValidationMessage
                    @description={{t "general.instructionalNotes"}}
                    @validationErrors={{this.validations.errors.instructionalNotes}}
                  />
                </EditableField>
              {{else}}
                {{! template-lint-disable no-triple-curlies}}
                {{{this.instructionalNotes}}}
              {{/if}}
            </span>
          </div>
          {{#unless this.isIndependentLearning}}
            <br />
            <div class="sessionassociatedgroups" data-test-associated-groups>
              <label>{{t "general.associatedGroups"}}:</label>
              <span>
                {{#if @session.associatedOfferingLearnerGroups}}
                  {{join ", " (map-by "title" @session.associatedOfferingLearnerGroups)}}
                {{else}}
                  {{t "general.none"}}
                {{/if}}
              </span>
            </div>
          {{/unless}}
        </div>
      </section>
    {{/if}}
  {{/let}}
</div>