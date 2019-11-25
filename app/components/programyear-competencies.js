import Component from '@ember/component';
import { computed } from '@ember/object';
import { all, filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['programyear-competencies'],

  canUpdate: false,
  isManaging: null,
  isSaving: false,
  programYear: null,
  selectedCompetencies: null,

  competencies: computed('programYear.program.school.competencies.[]', async function() {
    const program = await this.programYear.program;
    const school = await program.school;
    return await school.competencies;
  }),

  domains: computed('competencies.[]', async function() {
    const competencies = await this.competencies;
    const domains = await all(competencies.mapBy('domain'));
    return domains.uniq();
  }),

  competenciesWithSelectedChildren: computed('competencies.[]', 'selectedCompetencies.[]', async function() {
    const selectedCompetencies = this.selectedCompetencies;
    const competencies = await this.competencies;
    return await filter(competencies.toArray(), async (competency) => {
      const children = await competency.treeChildren;
      const selectedChildren = children.filter((c) => selectedCompetencies.includes(c));
      return selectedChildren.length > 0;
    });
  }),

  init() {
    this._super(...arguments);
    this.set('selectedCompetencies', []);
    this.loadSelectedCompetencies.perform();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.loadSelectedCompetencies.perform();
  },

  actions: {
    cancel() {
      this.loadSelectedCompetencies.perform();
      this.setIsManaging(false);
    },

    addCompetencyToBuffer(competency) {
      const selectedCompetencies = this.selectedCompetencies.toArray();
      selectedCompetencies.addObject(competency);
      competency.get('children').then(children => {
        selectedCompetencies.addObjects(children.toArray());
      });
      this.set('selectedCompetencies', selectedCompetencies);
    },

    removeCompetencyFromBuffer(competency) {
      const selectedCompetencies = this.selectedCompetencies.toArray();
      selectedCompetencies.removeObject(competency);
      competency.get('children').then(children => {
        selectedCompetencies.removeObjects(children.toArray());
      });
      this.set('selectedCompetencies', selectedCompetencies);
    },

    collapse() {
      this.get('programYear.competencies').then(competencies => {
        if (competencies.get('length')) {
          this.collapse();
        }
      });
    }
  },

  loadSelectedCompetencies: task(function* () {
    const programYear = this.programYear;
    if (programYear){
      const selectedCompetencies = yield programYear.get('competencies');
      this.set('selectedCompetencies', selectedCompetencies.toArray());
    } else {
      yield timeout(1000);
    }
  }).restartable(),

  save: task(function* () {
    yield timeout(10);
    const programYear = this.programYear;
    const selectedCompetencies = this.selectedCompetencies;
    programYear.set('competencies', selectedCompetencies);
    try {
      yield programYear.save();
    } finally {
      this.flashMessages.success('general.savedSuccessfully');
      this.setIsManaging(false);
      this.expand();
    }
  }).drop()
});
