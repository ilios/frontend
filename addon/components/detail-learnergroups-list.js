import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DetailLearnerGroupsListComponent extends Component {
  get learnerGroups() {
    return this.args.learnerGroups ?? [];
  }

  get topLevelGroups() {
    return this.learnerGroups.mapBy('topLevelGroup');
  }

  get trees() {
    const arr = this.topLevelGroups?.uniq() ?? [];
    return arr.map((topLevelGroup) => {
      const groups = this.learnerGroups.filter((group) => group.topLevelGroup === topLevelGroup);

      return {
        topLevelGroup,
        groups,
      };
    });
  }

  get lowestLeaves() {
    const ids = this.learnerGroups.mapBy('id');
    return this.learnerGroups.filter((group) => {
      const selectedChildren = group.allDescendants.filter((child) => ids.includes(child.id));
      return selectedChildren.length === 0;
    });
  }
  @action
  remove(learnerGroup) {
    if (this.args.isManaging) {
      this.args.remove(learnerGroup);
    }
  }
}
