import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, task } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class SchoolCompetenciesListItemComponent extends Component {
  @service store;
  @tracked isManaging = false;
  @tracked pcrsToRemove = [];
  @tracked pcrsToAdd = [];
  @use competencyPcrses = new ResolveAsyncValue(() => [this.args.competency?.aamcPcrses, []]);
  @use allPcrses = new ResolveAsyncValue(() => [this.store.findAll('aamcPcrs'), []]);

  get selectedPcrses() {
    const filteredCurrent = this.competencyPcrses.filter((p) => {
      return !this.pcrsToRemove.includes(p);
    });
    return [...this.pcrsToAdd, ...filteredCurrent].uniq();
  }

  @action
  setIsManaging(isManaging) {
    this.isManaging = isManaging;
  }

  @action
  cancel() {
    this.competenciesToAdd = [];
    this.competenciesToRemove = [];
    this.args.setIsManaging(false);
  }

  @dropTask
  *save() {
    // @todo implement [ST 2021/08/27]
  }

  @task
  *addCompetencyToBuffer(competency) {
    this.competenciesToAdd = [...this.competenciesToAdd, competency];
    const children = (yield competency.children).toArray();
    this.competenciesToAdd = [...this.competenciesToAdd, ...children];
    this.competenciesToRemove = this.competenciesToRemove.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }

  @task
  *removeCompetencyFromBuffer(competency) {
    this.competenciesToRemove = [...this.competenciesToRemove, competency];
    const children = (yield competency.children).toArray();
    this.competenciesToRemove = [...this.competenciesToRemove, ...children];
    this.competenciesToAdd = this.competenciesToAdd.filter((c) => {
      return c !== competency && !children.includes(c);
    });
  }
}
