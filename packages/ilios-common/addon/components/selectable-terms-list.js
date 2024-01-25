import Component from '@glimmer/component';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class SelectableTermsList extends Component {
  @use filteredTerms = new AsyncProcess(() => [
    this.getFilteredTerms.bind(this),
    this.args.parent,
    this.args.termFilter,
  ]);

  async getFilteredTerms(parent, termFilter) {
    const terms = (await parent.children).slice();
    if (termFilter) {
      const exp = new RegExp(termFilter, 'gi');
      return await filter(terms.slice(), async (term) => {
        const searchString = await term.getTitleWithDescendantTitles();
        return searchString.match(exp);
      });
    }
    return terms;
  }

  get terms() {
    return this.filteredTerms ?? [];
  }

  get level() {
    return this.args.level ?? 0;
  }
}
