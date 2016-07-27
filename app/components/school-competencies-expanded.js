import Ember from 'ember';

const { Component, computed, inject, RSVP, isPresent, isEmpty } = Ember;
const { filterBy } = computed;
const { service } = inject;

export default Component.extend({
  store: service(),
  school: null,
  isManaging: false,
  bufferedCompetencies: null,
  allDomains: filterBy('school.competencies', 'isDomain'),
  allCompetencies: filterBy('school.competencies', 'isNotDomain'),
  showCollapsible: computed('isManaging', 'school.competencies.length', function(){
    const isManaging = this.get('isManaging');
    const competencies = this.get('school.competencies');
    return competencies.get('length') && ! isManaging;
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    if (this.get('isManaging') && isEmpty(this.get('bufferedCompetencies'))) {
      this.get('school.competencies').then(competencies => {
        this.set('bufferedCompetencies', competencies.toArray());
      });
    }

  },
  actions: {
    collapse(){
      this.get('school.competencies').then(competencies => {
        if(competencies.length){
          this.attrs.collapse();
        }
      });
    },
    addCompetencyToBuffer(domain, title){
      let competency = this.get('store').createRecord('competency', {title});
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
      if (buffer.contains(competency)) {
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
          return !bufferedCompetencies.contains(competency);
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
      this.set('bufferedCompetencies', []);
      this.attrs.setSchoolManageCompetencies(false);
    },
    manage(){
      this.get('school.competencies').then(competencies => {
        this.set('bufferedCompetencies', competencies.toArray());
        this.attrs.setSchoolManageCompetencies(true);
      });
    }
  }
});
