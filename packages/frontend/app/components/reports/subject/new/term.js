import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { hash } from 'rsvp';

export default class ReportsSubjectNewProgramYearComponent extends Component {
  @service store;

  @cached
  get data() {
    return new TrackedAsyncData(
      hash({
        terms: this.store.findAll('term'),
        vocabularies: this.store.findAll('vocabulary'),
      }),
    );
  }

  get terms() {
    return this.data.value.terms;
  }

  get isLoaded() {
    return this.data.isResolved;
  }

  get mappedTerms() {
    return this.data.value.terms.map((term) => {
      const vocabularyId = term.belongsTo('vocabulary').id();
      const vocabulary = this.data.value.vocabularies.find(({ id }) => id === vocabularyId);
      const schoolId = vocabulary.belongsTo('school').id();
      const title = [...this.getParentTitlesForTerm(term), term.title].join(' > ');
      return {
        title,
        term,
        vocabulary,
        schoolId,
      };
    });
  }

  getParentTitlesForTerm(term) {
    const pId = term.belongsTo('parent').id();
    if (!pId) {
      return [];
    }
    const parent = this.terms.find((t) => t.id === pId);

    return [...this.getParentTitlesForTerm(parent), parent.title];
  }

  get filteredTerms() {
    if (this.args.school) {
      return this.mappedTerms.filter(({ schoolId }) => schoolId === this.args.school.id);
    }

    return this.mappedTerms;
  }

  get sortedTerms() {
    return sortBy(this.filteredTerms, ['vocabulary.title', 'title']);
  }

  setInitialValue = task(async () => {
    await timeout(1); //wait a moment so we can render before setting
    const ids = this.sortedTerms.map(({ term }) => term.id);
    if (ids.includes(this.args.currentId)) {
      return;
    }
    if (!this.sortedTerms.length) {
      this.args.changeId(null);
    } else {
      this.args.changeId(this.sortedTerms[0].term.id);
    }
  });
}
