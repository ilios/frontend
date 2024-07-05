import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolVocabulariesExpandedComponent extends Component {
  @service store;

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

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.loadSchool(this.args.school.id));
  }

  get isLoaded() {
    return this.schoolData.isResolved;
  }

  get vocabularies() {
    return this.schoolData.value
      .hasMany('vocabularies')
      .ids()
      .map((id) => {
        return this.store.peekRecord('vocabulary', id);
      });
  }

  get schoolVocabularies() {
    return this.vocabularies.map((vocabulary) => {
      const terms = vocabulary
        .hasMany('terms')
        .ids()
        .map((id) => {
          return this.store.peekRecord('term', id);
        });

      return {
        vocabulary,
        terms,
      };
    });
  }

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
