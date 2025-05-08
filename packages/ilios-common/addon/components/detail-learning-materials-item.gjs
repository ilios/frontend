<tr
  class={{if this.showRemoveConfirmation "confirm-removal"}}
  data-test-detail-learning-materials-item
>
  <td colspan="3">
    <button
      type="button"
      class="lm-title"
      {{on "click" (fn @setManagedMaterial @lm)}}
      data-test-title-manage
    >
      <LmTypeIcon @type={{@lm.learningMaterial.type}} @mimetype={{@lm.learningMaterial.mimetype}} />
      <span data-test-title>
        {{@lm.learningMaterial.title}}
      </span>
    </button>
  </td>
  <td class="text-center" colspan="2">
    <UserNameInfo @user={{this.owningUser}} />
  </td>
  <td class="text-center" colspan="2" data-test-required>
    {{#if @lm.required}}
      <span class="add">
        {{t "general.yes"}}
      </span>
    {{else}}
      <span class="remove">
        {{t "general.no"}}
      </span>
    {{/if}}
  </td>
  <td class="text-center" colspan="2">
    {{#if @lm.notes}}
      <span class="add" data-test-notes>
        {{t "general.yes"}}
      </span>
      {{#if @lm.publicNotes}}
        <FaIcon
          @icon="eye"
          @title={{t "general.visibleToStudents"}}
          data-test-visible-to-students
        />
      {{/if}}
    {{else}}
      <span class="remove" data-test-notes>
        {{t "general.no"}}
      </span>
    {{/if}}
  </td>
  <td class="text-center" colspan="2" data-test-mesh>
    {{#if this.meshDescriptorsLoaded}}
      {{#if this.meshDescriptors.length}}
        <ul>
          {{#each (sort-by "name" this.meshDescriptors) as |descriptor|}}
            <li>
              {{descriptor.name}}
            </li>
          {{/each}}
        </ul>
      {{else}}
        {{t "general.none"}}
      {{/if}}
    {{/if}}
  </td>
  <td class="text-center" colspan="2">
    <span data-test-status>
      {{@lm.learningMaterial.status.title}}
    </span>
    {{#if (or @lm.startDate @lm.endDate)}}
      <FaIcon @icon="clock" @title={{t "general.timedRelease"}} data-test-timed-release />
    {{/if}}
  </td>
  <td class="text-left text-center" colspan="1" data-test-actions>
    {{#if @editable}}
      <button
        type="button"
        class="icon-button"
        {{on "click" (fn @setManagedMaterial @lm)}}
        data-test-edit
      >
        <FaIcon @icon="pen-to-square" />
      </button>
      <button
        type="button"
        class="icon-button remove"
        {{on "click" (set this "showRemoveConfirmation" true)}}
        data-test-remove
      >
        <FaIcon @icon="trash" />
      </button>
    {{else}}
      <FaIcon @icon="trash" class="disabled" />
    {{/if}}
  </td>
</tr>
{{#if this.showRemoveConfirmation}}
  <tr class="confirm-removal" data-test-confirm-removal>
    <td colspan="14">
      <div class="confirm-message">
        {{t "general.confirmRemoval"}}
        <br />
        <div class="confirm-buttons">
          <button
            class="remove text"
            type="button"
            {{on "click" (perform this.remove @lm)}}
            data-test-confirm
          >
            {{t "general.yes"}}
          </button>
          <button
            class="done text"
            type="button"
            {{on "click" (set this "showRemoveConfirmation" false)}}
            data-test-cancel
          >
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    </td>
  </tr>
{{/if}}