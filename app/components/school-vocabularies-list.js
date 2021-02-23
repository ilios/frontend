import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {dropTask, restartableTask} from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class SchoolVocabulariesListComponent extends Component {
  @service store;
  @tracked @Length(1, 200) @NotBlank() newVocabularyTitle;
  @tracked vocabulariesRelationship;
  @tracked newVocabulary;
  @tracked showRemovalConfirmationFor;
  @tracked showNewVocabularyForm = false;

  get sortedVocabularies() {
    if (! this.vocabulariesRelationship) {
      return [];
    }
    return this.vocabulariesRelationship.filterBy('isNew', false).sortBy('title').toArray();
  }

  @restartableTask
  *load() {
    this.vocabulariesRelationship = yield this.args.school.vocabularies;
  }

  @action
  toggleShowNewVocabularyForm() {
    this.newVocabularyTitle = null;
    this.showNewVocabularyForm = !this.showNewVocabularyForm;
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
  *saveOrCancel(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      yield this.saveNew.perform();
    } else if (27 === keyCode) {
      this.args.close();
    }
  }

  @dropTask
  *saveNew() {
    this.addErrorDisplaysFor(['newVocabularyTitle']);
    const isValid = yield this.isValid();
    if (! isValid) {
      return false;
    }
    const vocabulary = this.store.createRecord('vocabulary', {
      title: this.newVocabularyTitle,
      school: this.args.school,
      active: true
    });
    const savedVocabulary = yield vocabulary.save();
    this.clearErrorDisplay();
    this.showNewVocabularyForm =  false;
    this.newVocabularyTitle =  null;
    this.newVocabulary = savedVocabulary;
  }

  @dropTask
  *remove(vocabulary) {
    yield vocabulary.destroyRecord();
    if (this.newVocabulary === vocabulary) {
      this.newVocabulary = null;
    }
  }
}
