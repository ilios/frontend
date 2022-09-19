import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class SchoolCompetenciesExpandedComponent extends Component {
  @service store;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];
  @tracked schoolCompetencies;

  @restartableTask
  *load() {
    this.cleanup();
    this.schoolCompetencies = yield this.args.school.competencies;
  }

  get competencies() {
    if (!this.schoolCompetencies) {
      return [];
    }
    const arr = [...this.schoolCompetencies.slice(), ...this.competenciesToAdd];
    return arr.filter((competency) => !this.competenciesToRemove.includes(competency)).uniq();
  }

  get domains() {
    return this.competencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
  }

  get childCompetencies() {
    return this.competencies.filter((competency) => {
      return competency.belongsTo('parent').id();
    });
  }

  get showCollapsible() {
    return this.competencies.length && !this.args.isManaging;
  }

  cleanup() {
    this.competenciesToAdd = [];
    this.competenciesToRemove = [];
  }

  @action
  collapse() {
    if (this.competencies.length) {
      this.args.collapse();
      this.cleanup();
    }
  }

  @action
  stopManaging() {
    this.cleanup();
    this.args.setSchoolManageCompetencies(false);
  }

  @action
  addCompetency(domain, title) {
    const competency = this.store.createRecord('competency', {
      title,
      active: true,
    });
    if (domain) {
      competency.set('parent', domain);
    }
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
  }
  @action
  removeCompetency(competency) {
    this.competenciesToAdd = this.competenciesToAdd.filter((c) => c !== competency);
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
  }

  @dropTask
  *save() {
    const domainsToRemove = this.schoolCompetencies.filter((competency) => {
      return !competency.belongsTo('parent').id() && !this.competencies.includes(competency);
    });
    const competenciesToRemove = this.schoolCompetencies.filter((competency) => {
      return competency.belongsTo('parent').id() && !this.competencies.includes(competency);
    });

    // delete all removed competencies first, then all removed domains
    yield all(competenciesToRemove.invoke('destroyRecord'));
    yield all(domainsToRemove.invoke('destroyRecord'));

    // set the school on new competencies
    this.competencies.filterBy('isNew').forEach((competency) => {
      competency.set('school', this.args.school);
    });

    // update all modified competencies (this will include new ones).
    yield all(this.competencies.filterBy('hasDirtyAttributes').invoke('save'));

    // cleanup
    this.cleanup();
    this.args.setSchoolManageCompetencies(false);
    this.schoolCompetencies = yield this.args.school.competencies;
  }
}
