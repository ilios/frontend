import Component from '@glimmer/component';
import { filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveAllValues from 'ilios/classes/resolve-all-values';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProgramYearCompetenciesComponent extends Component {
  @service flashMessages;
  @tracked competenciesToAdd = [];
  @tracked competenciesToRemove = [];
  @use program = new ResolveAsyncValue(() => [this.args.programYear.program]);
  @use school = new ResolveAsyncValue(() => [this.program?.school]);
  @use competencies = new ResolveAsyncValue(() => [this.school?.competencies, []]);
  @use allDomains = new ResolveAllValues(() => [mapBy(this.competencies?.slice() ?? [], 'domain')]);
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

  addCompetencyToBuffer = task(async (competency) => {
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
    const children = (await competency.children).slice();
    this.competenciesToAdd = [...this.competenciesToAdd, ...children];
    this.competenciesToRemove = this.competenciesToRemove.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  });

  removeCompetencyFromBuffer = task(async (competency) => {
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
    const children = (await competency.children).slice();
    this.competenciesToRemove = [...this.competenciesToRemove, ...children];
    this.competenciesToAdd = this.competenciesToAdd.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  });

  @action
  collapse() {
    if (this.selectedCompetencies.length) {
      this.args.collapse();
    }
  }

  save = task(async () => {
    await timeout(10);
    this.args.programYear.set('competencies', this.selectedCompetencies);
    try {
      await this.args.programYear.save();
    } finally {
      this.flashMessages.success('general.savedSuccessfully');
      this.args.setIsManaging(false);
      this.args.expand();
    }
  });
}
