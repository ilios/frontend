import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class LearnergroupBulkGroupMatcherComponent extends Component {
  get matchedGroupId() {
    const match = this.args.matches.findBy('name', this.args.groupName);
    return match ? match.group.id : null;
  }

  get noGroupWithThisName() {
    return !isPresent(this.args.groups.findBy('title', this.args.groupName));
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
