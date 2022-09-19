import Component from '@glimmer/component';
import { filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveAllValues from 'ilios/classes/resolve-all-values';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearCompetenciesComponent extends Component {
  @service flashMessages;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];
  @use program = new ResolveAsyncValue(() => [this.args.programYear.program]);
  @use school = new ResolveAsyncValue(() => [this.program?.school]);
  @use competencies = new ResolveAsyncValue(() => [this.school?.competencies, []]);
  @use allDomains = new ResolveAllValues(() => [this.competencies?.mapBy('domain')]);
  @use programYearCompetencies = new ResolveAsyncValue(() => [
    this.args.programYear.competencies,
    [],
  ]);

  @use competenciesWithSelectedChildren = new AsyncProcess(() => [
    this.getCompetenciesWithSelectedChildren,
    this.selectedCompetencies,
    this.competencies,
  ]);

  get domains() {
    return this.allDomains?.uniq() || [];
  }

  get selectedCompetencies() {
    const filteredCurrent = this.programYearCompetencies.filter((c) => {
      return !this.competenciesToRemove.includes(c);
    });
    return [...this.competenciesToAdd, ...filteredCurrent].uniq();
  }

  async getCompetenciesWithSelectedChildren(selectedCompetencies, competencies) {
    return await filter(competencies.slice(), async (competency) => {
      const children = await competency.children;
      const selectedChildren = children.filter((c) => selectedCompetencies.includes(c));
      return selectedChildren.length > 0;
    });
  }

  @action
  cancel() {
    this.competenciesToAdd = [];
    this.competenciesToRemove = [];
    this.args.setIsManaging(false);
  }

  @task
  *addCompetencyToBuffer(competency) {
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
    const children = (yield competency.children).slice();
    this.competenciesToAdd = [...this.competenciesToAdd, ...children];
    this.competenciesToRemove = this.competenciesToRemove.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }

  @task
  *removeCompetencyFromBuffer(competency) {
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
    const children = (yield competency.children).slice();
    this.competenciesToRemove = [...this.competenciesToRemove, ...children];
    this.competenciesToAdd = this.competenciesToAdd.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }

  @action
  collapse() {
    if (this.selectedCompetencies.length) {
      this.args.collapse();
    }
  }

  @task
  *save() {
    yield timeout(10);
    this.args.programYear.set('competencies', this.selectedCompetencies);
    try {
      yield this.args.programYear.save();
    } finally {
      this.flashMessages.success('general.savedSuccessfully');
      this.args.setIsManaging(false);
      this.args.expand();
    }
  }
}
