import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { all } from 'rsvp';

export default class DetailTermsListComponent extends Component {
  @tracked sortedTerms;

  @dropTask
  *load(event, [terms]) {
    if (!terms) {
      this.sortedTerms = [];
      return;
    }
    const filteredTerms = terms.filter((term) => {
      const vocabId = term.belongsTo('vocabulary').id();
      return vocabId === this.args.vocabulary.id;
    });
    const proxies = yield all(
      filteredTerms.map(async (term) => {
        const title = await term.getTitleWithParentTitles();
        return { term, title };
      })
    );
    const sortedProxies = proxies.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return titleA > titleB ? 1 : titleA < titleB ? -1 : 0;
    });

    this.sortedTerms = sortedProxies.mapBy('term');
  }
}
