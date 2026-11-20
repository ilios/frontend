import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';

import pick from '../../helpers/pick';
import { findBy } from '../../utils/array-helpers';

export default class LearnerGroupBulkGroupMatcherComponent extends Component {
  get matchedGroupId() {
    const match = findBy(this.args.matches, 'name', this.args.groupName);
    return match ? match.group.id : null;
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
      </td>
      <td>
        <select
          aria-label={{t "general.existingGroup"}}
          {{on "change" (pick "target.value" this.matchGroup)}}
        >
          <option value="null" selected={{eq null this.matchedGroupId}}>
            ({{t "general.createNewGroup"}})
          </option>
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
