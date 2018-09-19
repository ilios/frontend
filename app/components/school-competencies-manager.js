/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  classNames: ['school-competencies-manager'],
  competencies: null,
  canUpdate: false,
  canDelete: false,
  canCreate: false,
  domains: computed('competencies.[]', function(){
    let competencies = this.competencies;
    if(isEmpty(competencies)){
      return [];
    }
    let domains = competencies.filterBy('isDomain');
    let objs = domains.uniq().map(domain => {
      if (! domain.get('id')) {
        return {
          domain,
          competencies: []
        };
      }
      let domainCompetencies = competencies.filter(
        competency => competency.belongsTo('parent').id() === domain.get('id')
      );
      return {
        domain,
        competencies: domainCompetencies.sortBy('title')
      };
    });

    return objs.sortBy('domain.title');
  }),
  actions: {
    changeCompetencyTitle(value, competency){
      competency.set('title', value);
    }
  }
});
