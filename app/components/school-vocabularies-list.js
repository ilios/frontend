import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class SchoolVocabulariesListComponent extends Component {
  @service store;
  @tracked newVocabulary;
  @tracked showRemovalConfirmationFor;
  @use vocabularies = new ResolveAsyncValue(() => [this.args.school.vocabularies]);

  get sortedVocabularies() {
    if (!this.vocabularies) {
      return [];
    }
    return sortBy(filterBy(this.vocabularies.slice(), 'isNew', false), 'title');
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
