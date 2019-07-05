import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { all, filter, map } from 'rsvp';
import layout from '../templates/components/detail-learnergroups-list';

export default Component.extend({
  layout,
  classNames: ['detail-learnergroups-list'],
  learnerGroups: null,
  isManaging: false,

  /**
   * A list of objects, each representing a learner-group tree.
   * Each tree object contains its top-level group and a flat list of all its groups.
   * @property trees
   * @type {Ember.computed}
   * @public
   */
  trees: computed('learnerGroups.[]', async function(){
    const learnerGroups = this.get('learnerGroups');

    if (isEmpty(learnerGroups)) {
      return [];
    }

    const topLevelGroups = await all(learnerGroups.toArray().mapBy('topLevelGroup'));

    return await map(topLevelGroups.uniq(), async topLevelGroup => {
      const groups = await filter(learnerGroups.toArray(), async learnerGroup => {
        const thisGroupsTopLevelGroup = await learnerGroup.get('topLevelGroup');
        return (thisGroupsTopLevelGroup === topLevelGroup);
      });

      const sortProxies = await map(groups, async group => {
        const sortTitle = await group.get('sortTitle');
        return EmberObject.create({
          group,
          sortTitle
        });
      });

      return EmberObject.create({
        topLevelGroup,
        groups: sortProxies.sortBy('sortTitle').mapBy('group')
      });
    });
  }),

  lowestLeaves: computed('learnerGroups.[]', async function() {
    const learnerGroups = this.learnerGroups;
    const ids = learnerGroups.mapBy('id');

    if (isEmpty(learnerGroups)) {
      return [];
    }

    return await filter(learnerGroups.toArray(), async (group) => {
      const children = await group.allDescendants;
      const selectedChildren = children.filter((child) => ids.includes(child.id));
      return selectedChildren.length === 0;
    });
  })
});
