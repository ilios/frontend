import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
const { all, Promise, filter, map } = RSVP;

export default Component.extend({
  tagName: 'ul',
  classNames: ['learnergroups-list'],
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

  lowestLeaves: computed('learnerGroups.[]', function(){
    const learnerGroups = this.get('learnerGroups').toArray();
    const ids = learnerGroups.mapBy('id');
    return new Promise(resolve => {
      if (isEmpty(learnerGroups)) {
        return resolve([]);
      }
      filter(learnerGroups, group => {
        return new Promise(resolve => {
          group.get('allDescendants').then(children => {
            let selectedChildren = children.filter(child => ids.includes(child.get('id')));
            resolve(selectedChildren.length === 0);
          });
        });
      }).then(lowestLeaves => resolve(lowestLeaves));
    });
  }),
});
