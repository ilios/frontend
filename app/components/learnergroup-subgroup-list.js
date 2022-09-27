import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { dropTask } from 'ember-concurrency';
import pad from 'pad';
import countDigits from '../utils/count-digits';
import cloneLearnerGroup from '../utils/clone-learner-group';

export default class LearnergroupSubgroupListComponent extends Component {
  @service flashMessages;
  @service intl;
  @service store;
  @tracked isSaving = false;
  @tracked savedGroup;
  @tracked showNewLearnerGroupForm = false;
  @tracked currentGroupsSaved = 0;
  @tracked totalGroupsToSave = 0;

  @action
  async saveNewLearnerGroup(title) {
    const cohort = await this.args.parentGroup.cohort;
    const newLearnerGroup = this.store.createRecord('learner-group', {
      cohort,
      parent: this.args.parentGroup,
      title,
    });
    this.savedGroup = await newLearnerGroup.save();
    this.showNewLearnerGroupForm = false;
  }

  @action
  async generateNewLearnerGroups(num) {
    this.savedGroup = null;
    this.currentGroupsSaved = 0;
    this.isSaving = true;
    this.totalGroupsToSave = num;
    const offset = await this.args.parentGroup.subgroupNumberingOffset;
    const cohort = await this.args.parentGroup.cohort;
    const padBy = countDigits(offset + parseInt(num, 10));
    const parentTitle = this.args.parentGroup.title.substring(0, 60 - 1 - padBy);
    const groups = [];
    for (let i = 0; i < num; i++) {
      const newGroup = this.store.createRecord('learner-group', {
        cohort,
        parent: this.args.parentGroup,
        title: `${parentTitle} ${pad(padBy, offset + i, '0')}`,
      });
      groups.push(newGroup);
    }
    const saveSomeGroups = async (groupsToSave) => {
      const chunk = groupsToSave.splice(0, 6);
      await all(chunk.map((group) => group.save()));

      if (groupsToSave.length) {
        this.currentGroupsSaved = this.currentGroupsSaved + chunk.length;
        await saveSomeGroups(groupsToSave);
      } else {
        this.isSaving = false;
        this.flashMessages.success('general.savedSuccessfully');
        this.showNewLearnerGroupForm = false;
      }
    };
    await saveSomeGroups(groups);
  }

  @action
  removeLearnerGroup(learnerGroup) {
    return learnerGroup.destroyRecord();
  }

  copyGroup = dropTask(async (withLearners, learnerGroup) => {
    const cohort = await learnerGroup.cohort;
    const parentGroup = await learnerGroup.parent;
    const newGroups = await cloneLearnerGroup(
      this.store,
      learnerGroup,
      cohort,
      withLearners,
      parentGroup
    );
    // indicate that the top group is a copy
    newGroups[0].title = newGroups[0].title + ` (${this.intl.t('general.copy')})`;
    this.totalGroupsToSave = newGroups.length;
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      await newGroups[i].save();
      this.currentGroupsSaved = i + 1;
    }
    this.savedGroup = newGroups[0];
  });
}
