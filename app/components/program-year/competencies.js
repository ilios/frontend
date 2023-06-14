import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearCompetenciesComponent extends Component {
  @service flashMessages;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];

  @cached
  get upstreamRelationshipsData() {
    return new TrackedAsyncData(this.resolveUpstreamRelationships(this.args.programYear));
  }

  @cached
  get upstreamRelationships() {
    return this.upstreamRelationshipsData.isResolved ? this.upstreamRelationshipsData.value : null;
  }

  get program() {
    return this.upstreamRelationships?.program;
  }

  get school() {
    return this.upstreamRelationships?.school;
  }

  get competencies() {
    return this.upstreamRelationships?.competencies || [];
  }

  get programYearCompetencies() {
    return this.upstreamRelationships?.programYearCompetencies || [];
  }

  @use competenciesWithSelectedChildren = new AsyncProcess(() => [
    this.getCompetenciesWithSelectedChildren,
    this.selectedCompetencies,
    this.competencies,
  ]);

  get domains() {
    return uniqueValues(this.upstreamRelationships?.domains || []);
  }

  get selectedCompetencies() {
    const filteredCurrent = this.programYearCompetencies.filter((c) => {
      return !this.competenciesToRemove.includes(c);
    });
    return uniqueValues([...this.competenciesToAdd, ...filteredCurrent]);
  }

  async resolveUpstreamRelationships(programYear) {
    const program = await programYear.program;
    const school = await program.school;
    const competencies = await school.competencies;
    const domains = await map(competencies.slice(), async (c) => c.getDomain());
    const programYearCompetencies = await programYear.competencies;

    return { program, school, competencies, domains, programYearCompetencies };
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

  @action
  addCompetencyToBuffer(competency, children) {
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
    this.competenciesToAdd = [...this.competenciesToAdd, ...children];
    this.competenciesToRemove = this.competenciesToRemove.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }

  @action
  removeCompetencyFromBuffer(competency, children) {
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
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
