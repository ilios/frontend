import Ember from 'ember';

const { Component, computed, Object, RSVP, isEmpty } = Ember;
const { Promise, filter, map, resolve } = RSVP;

export default Component.extend({
  tagName: 'ul',
  classNames: ['learnergroups-list'],
  learnerGroups: null,
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
            }).then(groups => {
              resolve(groups);
            });
          });
          return Object.create({
            topLevelGroup,
            groups
          });
        });

        resolve(trees);
      });


    });
  }),
});
