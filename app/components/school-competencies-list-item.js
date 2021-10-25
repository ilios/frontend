import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class SchoolCompetenciesListItemComponent extends Component {
  @service store;
  @service flashMessages;
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

  get isDomain() {
    return !this.args.competency.belongsTo('parent').id();
  }

  @action
  setIsManaging(isManaging) {
    this.isManaging = isManaging;
  }

  @action
  cancel() {
    this.pcrsToAdd = [];
    this.pcrsToRemove = [];
    this.setIsManaging(false);
  }

  @action
  addPcrsToBuffer(pcrs) {
    if (this.pcrsToRemove.includes(pcrs)) {
      this.pcrsToRemove = this.pcrsToRemove.filter((obj) => obj.id !== pcrs.id);
    } else {
      this.pcrsToAdd = [...this.pcrsToAdd, pcrs];
    }
  }

  @action
  removePcrsFromBuffer(pcrs) {
    if (this.pcrsToAdd.includes(pcrs)) {
      this.pcrsToAdd = this.pcrsToAdd.filter((obj) => obj.id !== pcrs.id);
    } else {
      this.pcrsToRemove = [...this.pcrsToRemove, pcrs];
    }
  }

  @action
  async save() {
    this.args.competency.set('aamcPcrses', this.selectedPcrses);
    try {
      await this.args.competency.save();
    } finally {
      this.flashMessages.success('general.savedSuccessfully');
      this.cancel();
    }
  }
}
