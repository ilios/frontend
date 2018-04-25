/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { Promise, all, filter } from 'rsvp';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('selectedCompetencies', []);
    this.get('loadSelectedCompetencies').perform();
  },
  didUpdateAttrs(){
    this._super(...arguments);
    this.get('loadSelectedCompetencies').perform();
  },
  programYear: null,
  isManaging: null,
  classNames: ['programyear-competencies'],
  isSaving: false,
  canUpdate: false,
  selectedCompetencies: null,

  loadSelectedCompetencies: task(function * (){
    const programYear = this.get('programYear');
    if (programYear){
      let selectedCompetencies = yield programYear.get('competencies');
      this.set('selectedCompetencies', selectedCompetencies.toArray());
    } else {
      yield timeout(1000);
    }
  }).restartable(),

  save: task(function * () {
    yield timeout(10);
    let programYear = this.get('programYear');
    let selectedCompetencies = this.get('selectedCompetencies');
    programYear.set('competencies', selectedCompetencies);
    try {
      yield programYear.save();
    } finally {
      this.get('flashMessages').success('general.savedSuccessfully');
      this.get('setIsManaging')(false);
      this.get('expand')();
    }

  }).drop(),

  competencies: computed('programYear.program.school.competencies.[]', function(){
    return new Promise(resolve => {
      const programYear = this.get('programYear');
      programYear.get('program').then(program => {
        program.get('school').then(school => {
          school.get('competencies').then(competencies => {
            resolve(competencies);
          });
        });
      });
    });
  }),

  domains: computed('competencies.[]', function(){
    return new Promise(resolve => {
      this.get('competencies').then(competencies => {
        all(competencies.mapBy('domain')).then(domains => {
          resolve(domains.uniq());
        });
      });
    });
  }),

  competenciesWithSelectedChildren: computed('competencies.[]', 'selectedCompetencies.[]', function(){
    const selectedCompetencies = this.get('selectedCompetencies');
    return new Promise(resolve => {
      this.get('competencies').then(competencies => {
        filter(competencies.toArray(), (competency => {
          return new Promise(resolve => {
            competency.get('treeChildren').then(children => {
              let selectedChildren = children.filter(c => selectedCompetencies.includes(c));
              resolve(selectedChildren.length > 0);
            });
          });
        })).then(competenciesWithSelectedChildren => {
          resolve(competenciesWithSelectedChildren);
        });
      });
    });
  }),

  actions: {
    cancel() {
      this.get('loadSelectedCompetencies').perform();
      this.get('setIsManaging')(false);
    },
    addCompetencyToBuffer(competency) {
      let selectedCompetencies = this.get('selectedCompetencies').toArray();
      selectedCompetencies.addObject(competency);
      competency.get('children').then(children => {
        selectedCompetencies.addObjects(children.toArray());
      });
      this.set('selectedCompetencies', selectedCompetencies);
    },
    removeCompetencyFromBuffer(competency) {
      let selectedCompetencies = this.get('selectedCompetencies').toArray();
      selectedCompetencies.removeObject(competency);
      competency.get('children').then(children => {
        selectedCompetencies.removeObjects(children.toArray());
      });
      this.set('selectedCompetencies', selectedCompetencies);
    },
    collapse(){
      this.get('programYear.competencies').then(competencies => {
        if (competencies.get('length')) {
          this.get('collapse')();
        }
      });
    },
  }
});
