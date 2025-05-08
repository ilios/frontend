import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class SchoolCompetenciesListItemComponent extends Component {
  @service store;
  @service flashMessages;
  @tracked isManaging = false;
  @tracked pcrsToRemove = [];
  @tracked pcrsToAdd = [];

  @cached
  get competencyPcrsesData() {
    return new TrackedAsyncData(this.args.competency?.aamcPcrses);
  }

  get competencyPcrses() {
    return this.competencyPcrsesData.isResolved ? this.competencyPcrsesData.value : [];
  }

  @cached
  get allPcrsesData() {
    return new TrackedAsyncData(this.store.findAll('aamc-pcrs'));
  }

  get allPcrses() {
    return this.allPcrsesData.isResolved ? this.allPcrsesData.value : [];
  }

  get selectedPcrses() {
    const filteredCurrent = this.competencyPcrses.filter((p) => {
      return !this.pcrsToRemove.includes(p);
    });
    return uniqueValues([...this.pcrsToAdd, ...filteredCurrent]);
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
