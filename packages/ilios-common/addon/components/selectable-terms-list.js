import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';

export default class SelectableTermsList extends Component {
  @cached
  get termsData() {
    return new TrackedAsyncData(this.getFilteredTerms(this.args.parent, this.args.termFilter));
  }

  get terms() {
    return this.termsData.isResolved ? this.termsData.value : [];
  }

  async getFilteredTerms(parent, termFilter) {
    const terms = await parent.children;
    if (termFilter) {
      const exp = new RegExp(termFilter, 'gi');
      return await filter(terms, async (term) => {
        const searchString = await term.getTitleWithDescendantTitles();
        return searchString.match(exp);
      });
    }
    return terms;
  }

  get level() {
    return this.args.level ?? 0;
  }
}
