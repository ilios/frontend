import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';
import { all, filter, map } from 'rsvp';

export default class DetailLearnerGroupsListComponent extends Component {
  @tracked trees;
  @tracked lowestLeaves;

  @restartableTask
  *load(event, [learnerGroups]){
    if (!learnerGroups) {
      return;
    }

    const topLevelGroups = yield all(learnerGroups.toArray().mapBy('topLevelGroup'));

    this.trees = yield map(topLevelGroups.uniq(), async topLevelGroup => {
      const groups = await filter(learnerGroups.toArray(), async learnerGroup => {
        const thisGroupsTopLevelGroup = await learnerGroup.get('topLevelGroup');
        return (thisGroupsTopLevelGroup === topLevelGroup);
      });

      const sortProxies = await map(groups, async group => {
        const sortTitle = await group.get('sortTitle');
        return {
          group,
          sortTitle
        };
      });

      return {
        topLevelGroup,
        groups: sortProxies.sortBy('sortTitle').mapBy('group')
      };
    });

    const ids = learnerGroups.mapBy('id');
    this.lowestLeaves = yield filter(learnerGroups.toArray(), async (group) => {
      const children = await group.allDescendants;
      const selectedChildren = children.filter((child) => ids.includes(child.id));
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
