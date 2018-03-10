/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isEmpty, isPresent } from '@ember/utils';

export default Component.extend({
  store: service(),
  tagName: 'section',
  classNames: ['school-competencies-expanded'],
  school: null,
  isManaging: false,
  bufferedCompetencies: null,
  competencies: computed('school.competencies.[]', async function(){
    const school = this.get('school');
    const competencies = await school.get('competencies');

    return competencies;
  }),
  domains: computed('school.competencies.[]', async function(){
    const competencies = await this.get('competencies');
    const domains = competencies.filterBy('isDomain');

    return domains;
  }),
  childCompetencies: computed('school.competencies.[]', async function(){
    const competencies = await this.get('competencies');
    const childCompetencies = competencies.filterBy('isNotDomain');

    return childCompetencies;
  }),
  showCollapsible: computed('isManaging', 'school.competencies.length', function(){
    const isManaging = this.get('isManaging');
    const school = this.get('school');
    const competencyIds = school.hasMany('competencies').ids();
    return competencyIds.length && ! isManaging;
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    if (this.get('isManaging') && isEmpty(this.get('bufferedCompetencies'))) {
      const school = this.get('school');
      school.get('competencies').then(competencies => {
        this.set('bufferedCompetencies', competencies.toArray());
      });
    }

  },
  actions: {
    collapse(){
      const collapse = this.get('collapse');
      this.get('school.competencies').then(competencies => {
        if(competencies.length){
          collapse();
        }
      });
    },
    addCompetencyToBuffer(domain, title){
      let competency = this.get('store').createRecord('competency', {title, active: true});
      if (isPresent(domain)) {
        competency.set('parent', domain);
        domain.get('children').then(children => {
          children.pushObject(competency);
          this.get('bufferedCompetencies').pushObject(competency);
        });
      } else {
        this.get('bufferedCompetencies').pushObject(competency);
      }
    },
    removeCompetencyFromBuffer(competency){
      let buffer = this.get('bufferedCompetencies');
      if (buffer.includes(competency)) {
        buffer.removeObject(competency);
      }
    },
    save(){
      this.set('isSaving', true);
      let school = this.get('school');
      school.get('competencies').then(schoolCompetencies => {
        let promises = [];
        let domainsToRemove = [];
        let bufferedCompetencies = this.get('bufferedCompetencies');
        schoolCompetencies.filter(competency => {
          return !bufferedCompetencies.includes(competency);
        }).forEach(competency => {
          competency.deleteRecord();
          if (competency.get('isDomain')) {
            domainsToRemove.pushObject(competency);
          } else {
            promises.pushObject(competency.save());
          }

        });
        bufferedCompetencies.filterBy('isNew').forEach(competency => {
          competency.set('school', school);
        });
        promises.pushObjects(bufferedCompetencies.filterBy('hasDirtyAttributes').invoke('save'));
        schoolCompetencies.clear();
        bufferedCompetencies.forEach(competency=>{
          schoolCompetencies.pushObject(competency);
        });
        RSVP.all(promises).then(() => {
          RSVP.all(domainsToRemove.invoke('save')).then(() => {
            this.set('isManaging', false);
            this.set('bufferedTopics', []);
            this.set('isSaving', false);
          });
        });
      });
    },
    cancel(){
      const setSchoolManageCompetencies = this.get('setSchoolManageCompetencies');
      this.set('bufferedCompetencies', []);
      setSchoolManageCompetencies(false);
    },
    manage(){
      const setSchoolManageCompetencies = this.get('setSchoolManageCompetencies');
      this.get('school.competencies').then(competencies => {
        this.set('bufferedCompetencies', competencies.toArray());
        setSchoolManageCompetencies(true);
      });
    }
  }
});
