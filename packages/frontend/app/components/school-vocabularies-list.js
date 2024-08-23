import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class SchoolVocabulariesListComponent extends Component {
  @service store;
  @tracked newVocabulary;
  @tracked showRemovalConfirmationFor;

  @cached
  get vocabulariesData() {
    return new TrackedAsyncData(this.args.school.vocabularies);
  }

  get vocabularies() {
    return this.vocabulariesData.isResolved ? this.vocabulariesData.value : null;
  }

  get sortedVocabularies() {
    if (!this.vocabularies) {
      return [];
    }
    return sortBy(filterBy(this.vocabularies, 'isNew', false), 'title');
  }

  @action
  confirmRemoval(vocabulary) {
    this.showRemovalConfirmationFor = vocabulary;
  }

  @action
  cancelRemoval() {
    this.showRemovalConfirmationFor = null;
  }

  remove = dropTask(async (vocabulary) => {
    await vocabulary.destroyRecord();
    if (this.newVocabulary === vocabulary) {
      this.newVocabulary = null;
    }
  });
}
