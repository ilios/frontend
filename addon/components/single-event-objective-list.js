import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  classNames: ['single-event-objective-list'],
  objectives: null,
  groupByCompetencies: true,

  /**
   * TRUE if the at least one of the given objectives has its sort priority set, otherwise FALSE.
   * @property showDisplayModeToggle
   * @type {Ember.computed}
   */
  showDisplayModeToggle: computed('objectives.[]', function(){
    const objectives = this.get('objectives');
    if (isEmpty(objectives)) {
      return false;
    }
    return !! objectives.reduce((prevValue, objective) => {
      return Math.max(prevValue, objective.position);
    }, 0);
  }),

  domains: computed('objectives.[]', function(){
    const objectives = this.get('objectives');
    if (isEmpty(objectives)) {
      return [];
    }

    let domainTitles = objectives.map(obj => {
      return obj.domain.toString();
    });

    domainTitles = domainTitles.uniq();

    const domains = domainTitles.map(title => {
      const domain = {
        title,
        objectives: []
      };
      const filteredObjectives = objectives.filter(obj => {
        return obj.domain.toString() === title;
      }).map(obj => {
        return obj.title;
      });
      domain.objectives = filteredObjectives.sortBy('title');

      return domain;
    });

    return domains.sortBy('title');
  })
});
