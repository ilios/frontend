import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { findBy } from 'ilios-common/utils/array-helpers';

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
}
