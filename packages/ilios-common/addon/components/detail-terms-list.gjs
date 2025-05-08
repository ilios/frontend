import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailTermsListComponent extends Component {
  @cached
  get termsData() {
    const terms = this.args.terms ?? [];
    return new TrackedAsyncData(
      Promise.all(
        terms.map(async (term) => {
          const title = await term.getTitleWithParentTitles();
          const vocabulary = await term.vocabulary;
          return { term, title, vocabulary };
        }),
      ),
    );
  }

  get filteredTerms() {
    if (!this.termsData.isResolved) {
      return [];
    }
    return this.termsData.value.filter(({ vocabulary }) => {
      return vocabulary.id === this.args.vocabulary.id;
    });
  }

  get sortedTerms() {
    return this.filteredTerms.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return titleA > titleB ? 1 : titleA < titleB ? -1 : 0;
    });
  }

  get terms() {
    return this.sortedTerms.map(({ term }) => term);
  }
}
