import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';
import { map } from 'rsvp';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SchoolVocabulariesExpandedComponent extends Component {
  @service store;
  @tracked schoolVocabularies;

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

  @restartableTask
  *load(element, [school]) {
    yield this.loadSchool(school.id);
    const vocabularies = (yield school.vocabularies).toArray();
    this.schoolVocabularies = yield map(vocabularies, async vocabulary => {
      const terms = await vocabulary.terms;
      return {
        vocabulary,
        terms,
      };
    });
  }

  get managedVocabulary() {
    if (!this.args.managedVocabularyId || !this.schoolVocabularies) {
      return null;
    }

    const { vocabulary } = this.schoolVocabularies.find(({ vocabulary }) => {
      return Number(this.args.managedVocabularyId) === Number(vocabulary.id);
    });

    return vocabulary;
  }

  get managedTerm() {
    if (!this.schoolVocabularies || !this.args.managedVocabularyId || !this.args.managedTermId) {
      return null;
    }

    const { terms } = this.schoolVocabularies.find(({ vocabulary }) => {
      return Number(this.args.managedVocabularyId) === Number(vocabulary.id);
    });

    return terms.findBy('id', this.args.managedTermId);
  }

  @action
  doCollapse() {
    if (this.isCollapsible && this.schoolVocabularies.length) {
      this.args.collapse();
      this.args.setSchoolManagedVocabulary(null);
      this.args.setSchoolManagedVocabularyTerm(null);
    }
  }
}
