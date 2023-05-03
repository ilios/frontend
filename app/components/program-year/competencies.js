import Component from '@glimmer/component';
import { filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import ResolveAllValues from 'ilios/classes/resolve-all-values';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearCompetenciesComponent extends Component {
  @service flashMessages;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];

  @cached
  get programData() {
    return new TrackedAsyncData(this.args.programYear.program);
  }

  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.program?.school);
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  @cached
  get competenciesData() {
    return new TrackedAsyncData(this.school?.competencies);
  }

  get competencies() {
    return this.competenciesData.isResolved ? this.competenciesData.value : [];
  }

  @use allDomains = new ResolveAllValues(() => [mapBy(this.competencies?.slice() ?? [], 'domain')]);

  @cached
  get programYearCompetenciesData() {
    return new TrackedAsyncData(this.args.programYear.competencies);
  }

  get programYearCompetencies() {
    return this.programYearCompetenciesData.isResolved
      ? this.programYearCompetenciesData.value
      : [];
  }

  @use competenciesWithSelectedChildren = new AsyncProcess(() => [
    this.getCompetenciesWithSelectedChildren,
    this.selectedCompetencies,
    this.competencies,
  ]);

  get domains() {
    if (!this.allDomains) {
      return [];
    }
    return uniqueValues(this.allDomains);
  }

  get selectedCompetencies() {
    const filteredCurrent = this.programYearCompetencies.filter((c) => {
      return !this.competenciesToRemove.includes(c);
    });
    return uniqueValues([...this.competenciesToAdd, ...filteredCurrent]);
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
