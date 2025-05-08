<section
  class="school-session-attributes-expanded"
  data-test-school-session-attributes-expanded
  ...attributes
>
  <div class="school-session-attributes-expanded-header">
    {{#if @isManaging}}
      <div class="title" data-test-title>
        {{t "general.sessionAttributes"}}
      </div>
    {{else}}
      <button
        class="title link-button"
        type="button"
        aria-expanded="true"
        data-test-title
        {{on "click" @collapse}}
      >
        {{t "general.sessionAttributes"}}
        <FaIcon @icon="caret-down" />
      </button>
    {{/if}}
    <div class="actions">
      {{#if @isManaging}}
        <button type="button" class="bigadd" {{on "click" (perform this.save)}} data-test-save>
          <FaIcon
            @icon={{if this.save.isRunning "spinner" "check"}}
            @spin={{this.save.isRunning}}
          />
        </button>
        <button type="button" class="bigcancel" {{on "click" this.cancel}} data-test-cancel>
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else if @canUpdate}}
        <button type="button" {{on "click" (fn @manage true)}} data-test-manage>
          {{t "general.manageSessionAttributes"}}
        </button>
      {{/if}}
    </div>
  </div>
  <div class="school-session-attributes-expanded-content" data-test-expanded>
    {{#if @isManaging}}
      <SchoolSessionAttributesManager
        @showSessionAttendanceRequired={{this.showSessionAttendanceRequired}}
        @showSessionSupplemental={{this.showSessionSupplemental}}
        @showSessionSpecialAttireRequired={{this.showSessionSpecialAttireRequired}}
        @showSessionSpecialEquipmentRequired={{this.showSessionSpecialEquipmentRequired}}
        @enable={{this.enableSessionAttributeConfig}}
        @disable={{this.disableSessionAttributeConfig}}
      />
    {{else}}
      <table data-test-attributes>
        <thead>
          <tr>
            <th class="text-left">
              {{t "general.attribute"}}
            </th>
            <th class="text-left">
              {{t "general.enabled"}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr data-test-attendance-required>
            <td>
              {{t "general.attendanceRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if this.showSessionAttendanceRequired "check" "ban"}}
                class={{if this.showSessionAttendanceRequired "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-supplemental>
            <td>
              {{t "general.supplementalCurriculum"}}
            </td>
            <td>
              <FaIcon
                @icon={{if this.showSessionSupplemental "check" "ban"}}
                class={{if this.showSessionSupplemental "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-special-attire-required>
            <td>
              {{t "general.specialAttireRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if this.showSessionSpecialAttireRequired "check" "ban"}}
                class={{if this.showSessionSpecialAttireRequired "yes" "no"}}
              />
            </td>
          </tr>
          <tr data-test-special-equipment-required>
            <td>
              {{t "general.specialEquipmentRequired"}}
            </td>
            <td>
              <FaIcon
                @icon={{if this.showSessionSpecialEquipmentRequired "check" "ban"}}
                class={{if this.showSessionSpecialEquipmentRequired "yes" "no"}}
              />
            </td>
          </tr>
        </tbody>
      </table>
    {{/if}}
  </div>
</section>