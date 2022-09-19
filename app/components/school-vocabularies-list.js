import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class SchoolVocabulariesListComponent extends Component {
  @service store;
  @tracked vocabulariesRelationship;
  @tracked newVocabulary;
  @tracked showRemovalConfirmationFor;

  get sortedVocabularies() {
    if (!this.vocabulariesRelationship) {
      return [];
    }
    return this.vocabulariesRelationship.filterBy('isNew', false).sortBy('title').slice();
  }

  @restartableTask
  *load() {
    this.vocabulariesRelationship = yield this.args.school.vocabularies;
  }

  @action
  confirmRemoval(vocabulary) {
    this.showRemovalConfirmationFor = vocabulary;
  }

  @action
  cancelRemoval() {
    this.showRemovalConfirmationFor = null;
  }

  @dropTask
  *remove(vocabulary) {
    yield vocabulary.destroyRecord();
    if (this.newVocabulary === vocabulary) {
      this.newVocabulary = null;
    }
  }
}
