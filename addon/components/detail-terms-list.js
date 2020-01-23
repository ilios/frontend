import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';
import { all } from 'rsvp';

export default class DetailTermsListComponent extends Component {
  @tracked sortedTerms;

  @dropTask
  *load(event, [filteredTerms]) {
    const proxies = yield all(filteredTerms.map(async term => {
      const title = await term.titleWithParentTitles;
      return { term, title };
    }));
    const sortedProxies = proxies.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return (titleA > titleB ? 1 : (titleA < titleB ? -1 : 0));
    });

    this.sortedTerms = sortedProxies.mapBy('term');
  }

  get filteredTerms() {
    if (!this.args.terms) {
      return [];
    }
    return this.args.terms.filter(term => {
      const vocabId = term.belongsTo('vocabulary').id();
      return vocabId === this.args.vocabulary.id;
    });
  }
}
