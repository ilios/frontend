import Ember from 'ember';

const { Component, computed, Object:EmberObject, RSVP, isEmpty } = Ember;
const { Promise, filter, map, resolve } = RSVP;

export default Component.extend({
  tagName: 'ul',
  classNames: ['learnergroups-list'],
  learnerGroups: null,
  isManaging: false,
  trees: computed('learnerGroups.[]', function(){
    const learnerGroups = this.get('learnerGroups');

    if (isEmpty(learnerGroups)) {
      return resolve([]);
    }

    return new Promise(resolve => {
      map(learnerGroups.toArray(), (group => group.get('topLevelGroup'))).then(topLevelGroups => {
        let trees = topLevelGroups.uniq().map(topLevelGroup => {
          let groups = new Promise(resolve => {
            filter(learnerGroups.toArray(), child => {
              return new Promise(resolve => {
                child.get('topLevelGroup').then(childTopLevelGroup => {
                  resolve(childTopLevelGroup === topLevelGroup);
                });
              });
            }).then(filteredGroups => {
              resolve(filteredGroups);
            });
          });
          return EmberObject.create({
            topLevelGroup,
            groups
          });
        });

        resolve(trees);
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
