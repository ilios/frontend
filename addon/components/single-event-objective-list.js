import Ember from 'ember';
import layout from '../templates/components/single-event-objective-list';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  layout,
  classNames: ['single-event-objective-list'],
  objectives: null,
  groupByCompetencies: true,

  /**
   * TRUE if the at least one of the given objectives has its sort priority set, otherwise FALSE.
   * @property showDisplayModeToggle
   * @type {Ember.computed}
   */
  showDisplayModeToggle: computed('objectives.[]', function(){
    let objectives = this.get('objectives');
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
      return Ember.A();
    }

    let domainTitles = objectives.map(obj => {
      return obj.domain.toString();
    });

    domainTitles = Ember.A(domainTitles).uniq();

    let domains = domainTitles.map(title => {
      let domain = {
        title,
        objectives: []
      };
      let filteredObjectives = objectives.filter(obj => {
        return obj.domain.toString() === title;
      }).map(obj => {
        return obj.title;
      });
      domain.objectives = Ember.A(filteredObjectives).sortBy('title');

      return domain;
    });

    return Ember.A(domains).sortBy('title');
  })
});
