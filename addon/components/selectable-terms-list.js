import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { filter } from 'rsvp';

export default class SelectableTermsList extends Component {
  @tracked terms = [];

  get topLevelTermsRelationshipPromise() {
    return this.args.vocabulary ? this.args.vocabulary.getTopLevelTerms() : null;
  }

  loadFilteredTerms = restartableTask(async () => {
    let terms = [];
    if (this.topLevelTermsRelationshipPromise) {
      terms = (await this.topLevelTermsRelationshipPromise).slice();
    } else if (this.args.terms) {
      terms = this.args.terms.slice();
    }

    if (this.args.termFilter) {
      const exp = new RegExp(this.args.termFilter, 'gi');
      this.terms = await filter(terms, async (term) => {
        const searchString = await term.getTitleWithDescendantTitles();
        return searchString.match(exp);
      });
    } else {
      this.terms = terms;
    }
  });
}
