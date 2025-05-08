<tr
  class="learner-group-bulk-group-matcher {{if this.matchedGroupId 'matched' 'not-matched'}}"
  data-test-learner-group-bulk-group-matcher
  ...attributes
>
  {{#let (unique-id) as |templateId|}}
    <td>
      <span data-test-group-name>
        {{@groupName}}
      </span>
      {{#if this.noGroupWithThisName}}
        <button type="button" data-test-create-group {{on "click" (fn @createGroup @groupName)}}>
          {{t "general.createNewGroup" title=@groupName}}
        </button>
      {{/if}}
    </td>
    <td>
      <select {{on "change" (pick "target.value" this.matchGroup)}} id="sub-group-{{templateId}}">
        <option value="null" selected={{eq null this.matchedGroupId}}></option>
        {{#each @groups as |learnerGroup|}}
          <option value={{learnerGroup.id}} selected={{eq learnerGroup.id this.matchedGroupId}}>
            {{learnerGroup.title}}
          </option>
        {{/each}}
      </select>
    </td>
  {{/let}}
</tr>