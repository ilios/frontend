import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { findById } from 'ilios-common/utils/array-helpers';

export default class SchoolVocabulariesExpandedComponent extends Component {
  @service store;
  @tracked schoolVocabularies = [];

  #loadedSchools = {};

  get isManaging() {
    return !!this.args.managedVocabularyId;
  }

  get isCollapsible() {
    return this.schoolVocabularies?.length && !this.isManaging;
  }

  async loadSchool(schoolId) {
    if (!(schoolId in this.#loadedSchools)) {
      this.#loadedSchools[schoolId] = this.store.findRecord('school', schoolId, {
        include: 'vocabularies.terms',
        reload: true,
      });
    }

    return this.#loadedSchools[schoolId];
  }

  load = restartableTask(async () => {
    await this.loadSchool(this.args.school.id);
    const vocabularies = (await this.args.school.vocabularies).slice();
    this.schoolVocabularies = await map(vocabularies, async (vocabulary) => {
      const terms = await vocabulary.terms;
      return {
        vocabulary,
        terms,
      };
    });
  });

  get managedVocabulary() {
    if (!this.args.managedVocabularyId || !this.schoolVocabularies.length) {
      return null;
    }

    const { vocabulary } = this.schoolVocabularies.find(({ vocabulary }) => {
      return Number(this.args.managedVocabularyId) === Number(vocabulary.id);
    });

    return vocabulary;
  }

  get managedTerm() {
    if (
      !this.schoolVocabularies.length ||
      !this.args.managedVocabularyId ||
      !this.args.managedTermId
    ) {
      return null;
    }

    const { terms } = this.schoolVocabularies.find(({ vocabulary }) => {
      return Number(this.args.managedVocabularyId) === Number(vocabulary.id);
    });

    return findById(terms, this.args.managedTermId);
  }

  @action
  doCollapse() {
    if (this.isCollapsible && this.schoolVocabularies.length) {
      this.args.collapse();
      this.args.setSchoolManagedVocabulary(null);
      this.args.setSchoolManagedVocabularyTerm(null);
    }
  }

  saveNewVocabulary = dropTask(async (title, school, active) => {
    const vocabulary = this.store.createRecord('vocabulary', {
      title,
      school,
      active,
    });
    this.args.setSchoolNewVocabulary(null);
    await vocabulary.save();
  });
}
