import Component from '@glimmer/component';
import { service } from '@ember/service';
import { all } from 'rsvp';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { filterBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolCompetenciesExpandedComponent extends Component {
  @service store;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];

  @cached
  get schoolCompetenciesData() {
    return new TrackedAsyncData(this.args.school.competencies);
  }

  get competencies() {
    if (!this.schoolCompetenciesData.isResolved) {
      return [];
    }
    const arr = [...this.schoolCompetenciesData.value, ...this.competenciesToAdd];
    return uniqueValues(
      arr.filter((competency) => !this.competenciesToRemove.includes(competency)),
    );
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

  save = dropTask(async () => {
    const competencies = this.schoolCompetenciesData.value;
    const domainsToRemove = competencies.filter((competency) => {
      return !competency.belongsTo('parent').id() && !this.competencies.includes(competency);
    });
    const competenciesToRemove = competencies.filter((competency) => {
      return competency.belongsTo('parent').id() && !this.competencies.includes(competency);
    });

    // delete all removed competencies first, then all removed domains
    await all(competenciesToRemove.map((competency) => competency.destroyRecord()));
    await all(domainsToRemove.map((domain) => domain.destroyRecord()));

    // set the school on new competencies
    filterBy(this.competencies, 'isNew').forEach((competency) => {
      competency.set('school', this.args.school);
    });

    // update all modified competencies (this will include new ones).
    await all(
      filterBy(this.competencies, 'hasDirtyAttributes').map((competency) => competency.save()),
    );

    // cleanup
    this.cleanup();
    this.args.setSchoolManageCompetencies(false);
  });
}
