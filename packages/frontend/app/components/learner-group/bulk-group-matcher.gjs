import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { findBy } from 'ilios-common/utils/array-helpers';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pick from 'ilios-common/helpers/pick';
import { eq } from 'ember-truth-helpers';

export default class LearnerGroupBulkGroupMatcherComponent extends Component {
  get matchedGroupId() {
    const match = findBy(this.args.matches, 'name', this.args.groupName);
    return match ? match.group.id : null;
  }

  get noGroupWithThisName() {
    return !isPresent(findBy(this.args.groups, 'title', this.args.groupName));
  }

  @action
  matchGroup(learnerGroupId) {
    if (learnerGroupId === 'null') {
      this.args.unsetMatch(this.args.groupName);
    } else {
      this.args.setMatch(this.args.groupName, learnerGroupId);
    }
  }
  <template>
    <tr
      class="learner-group-bulk-group-matcher {{if this.matchedGroupId 'matched' 'not-matched'}}"
      data-test-learner-group-bulk-group-matcher
      ...attributes
    >
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
        <select
          aria-label={{t "general.existingGroup"}}
          {{on "change" (pick "target.value" this.matchGroup)}}
        >
          <option value="null" selected={{eq null this.matchedGroupId}}></option>
          {{#each @groups as |learnerGroup|}}
            <option value={{learnerGroup.id}} selected={{eq learnerGroup.id this.matchedGroupId}}>
              {{learnerGroup.title}}
            </option>
          {{/each}}
        </select>
      </td>
    </tr>
  </template>
}
